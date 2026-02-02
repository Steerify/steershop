import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);
    
    // Find users whose subscription expires in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const startOfDay = new Date(threeDaysFromNow);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(threeDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log(`Looking for subscriptions expiring between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);
    
    const { data: expiringUsers, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, subscription_expires_at, is_subscribed, role')
      .gte('subscription_expires_at', startOfDay.toISOString())
      .lte('subscription_expires_at', endOfDay.toISOString())
      .eq('role', 'shop_owner');
    
    if (error) {
      console.error("Error fetching expiring users:", error);
      throw error;
    }
    
    console.log(`Found ${expiringUsers?.length || 0} users with expiring subscriptions`);
    
    const notifiedCount = { success: 0, failed: 0, skipped: 0 };
    
    for (const user of expiringUsers || []) {
      try {
        // Check if notification already sent today for this type
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await supabase
          .from('subscription_notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('notification_type', 'expiring_3_days')
          .gte('sent_at', today)
          .maybeSingle();
        
        if (existing) {
          console.log(`Already notified user ${user.email} today, skipping`);
          notifiedCount.skipped++;
          continue;
        }
        
        // Get user's shop for personalization
        const { data: shop } = await supabase
          .from('shops')
          .select('shop_name')
          .eq('owner_id', user.id)
          .single();
        
        const shopName = shop?.shop_name || 'your shop';
        const expiryDate = new Date(user.subscription_expires_at!).toLocaleDateString('en-NG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const subscriptionType = user.is_subscribed ? 'subscription' : 'trial';
        
        // Send email
        const emailResponse = await resend.emails.send({
          from: "SteerSolo <noreply@steersolo.com>",
          to: [user.email],
          subject: `⏰ Your ${subscriptionType} expires in 3 days - ${shopName}`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #16a34a, #22c55e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .cta-button { display: inline-block; background: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ 3 Days Left!</h1>
    </div>
    <div class="content">
      <p>Hi ${user.full_name || 'there'},</p>
      
      <p>Your ${subscriptionType} for <strong>${shopName}</strong> is expiring on <strong>${expiryDate}</strong>.</p>
      
      <div class="warning">
        <strong>⚠️ What happens when it expires?</strong>
        <ul>
          <li>Your shop will be hidden from customers</li>
          <li>Customers won't be able to place new orders</li>
          <li>Your products will no longer be visible</li>
        </ul>
      </div>
      
      <p>Don't let your business go offline! Renew now to keep selling without interruption.</p>
      
      <center>
        <a href="https://steersolo.lovable.app/subscription" class="cta-button">
          Renew Now →
        </a>
      </center>
      
      <p>If you have any questions, just reply to this email or visit our FAQ.</p>
      
      <p>Keep growing! 🚀<br>
      <strong>The SteerSolo Team</strong></p>
    </div>
    <div class="footer">
      <p>SteerSolo - Launch your online store in minutes</p>
      <p>You're receiving this because you have a shop on SteerSolo.</p>
    </div>
  </div>
</body>
</html>
          `,
        });
        
        console.log(`Email sent to ${user.email}:`, emailResponse);
        
        // Record the notification
        await supabase.from('subscription_notifications').insert({
          user_id: user.id,
          notification_type: 'expiring_3_days',
          subscription_expires_at: user.subscription_expires_at,
        });
        
        notifiedCount.success++;
        
      } catch (emailError) {
        console.error(`Failed to notify ${user.email}:`, emailError);
        notifiedCount.failed++;
      }
    }
    
    console.log("Notification summary:", notifiedCount);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${expiringUsers?.length || 0} expiring subscriptions`,
      notified: notifiedCount
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in subscription-reminder:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
