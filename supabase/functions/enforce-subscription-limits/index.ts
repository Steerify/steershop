import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { enqueueTransactionalEmail } from "../_shared/queue-email.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: only the cron job (or service-role caller) may trigger this.
    // Set CRON_SECRET in Supabase function secrets and pg_cron must include
    // the matching x-cron-secret header.
    const cronSecret = Deno.env.get('CRON_SECRET');
    const provided = req.headers.get('x-cron-secret');
    if (!cronSecret || provided !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    console.log("Starting subscription enforcement check...");
    
    // 1. Execute the database function to deactivate shops
    const { error: rpcError } = await supabase.rpc('enforce_subscription_limits');
    
    if (rpcError) {
      console.error("Error executing enforce_subscription_limits RPC:", rpcError);
      throw rpcError;
    }
    
    // 2. Find users whose shops were recently deactivated by the logic above to notify them.
    // We filter by is_active = false and a recent updated_at timestamp.
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    
    const { data: deactivatedShops, error: shopError } = await supabase
      .from('shops')
      .select('id, shop_name, owner_id, profiles(email, full_name)')
      .eq('is_active', false)
      .gte('updated_at', threeMinutesAgo);
      
    if (shopError) {
      console.error("Error fetching recently deactivated shops:", shopError);
    } else {
      console.log(`Found ${deactivatedShops?.length || 0} recently deactivated shops to notify`);
      
      for (const shop of deactivatedShops || []) {
        const profile = Array.isArray(shop.profiles) ? shop.profiles[0] : shop.profiles;
        if (!profile?.email) continue;
        
        try {
          const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .cta-button { display: inline-block; background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>Your shop is currently hidden from the marketplace</h1>
  <p>Hi ${profile.full_name || 'there'},</p>
  <p>Your subscription for <strong>${shop.shop_name}</strong> expired more than 3 days ago.</p>
  <p>Because your shop has more than 5 products, it has been temporarily removed from the marketplace to comply with our free tier limits.</p>
  <p><strong>To get your shop back online, you can:</strong></p>
  <ul>
    <li><strong>Upgrade your plan:</strong> Choose a subscription that supports your product count.</li>
    <li><strong>Reduce your products:</strong> Remove products until you have 5 or fewer, then reactivate your shop in settings.</li>
  </ul>
  <a href="https://steersolo.com/pricing" class="cta-button">View Pricing & Plans</a>
  <p>Keep growing! 🚀<br>The SteerSolo Team</p>
</body>
</html>
`;
          
          await enqueueTransactionalEmail(supabase, {
            to: profile.email,
            subject: `⚠️ Action Required: Your shop "${shop.shop_name}" has been hidden`,
            html: htmlContent,
            label: 'shop-deactivated-notification'
          });

          console.log(`Notification queued for ${profile.email} for shop ${shop.shop_name}`);
        } catch (emailError) {
          console.error(`Failed to queue deactivation email for ${profile.email}:`, emailError);
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Subscription enforcement completed"
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error: any) {
    console.error("Error in enforce-subscription-limits:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
