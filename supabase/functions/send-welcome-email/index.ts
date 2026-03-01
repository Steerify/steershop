import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') || '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { shopName, shopSlug } = await req.json();

    if (!shopName || !shopSlug) {
      return new Response(JSON.stringify({ error: 'Missing shopName or shopSlug' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile
    const serviceClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: 'No email found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const storeLink = `https://steersolo.com/shop/${shopSlug}`;
    const name = profile.full_name || 'there';

    // Send welcome email using Resend if available, otherwise log
    const resendKey = Deno.env.get('RESEND_API_KEY');
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; padding: 30px 25px; }
    .logo { border-radius: 8px; margin-bottom: 24px; }
    h1 { font-family: 'Poppins', Arial, sans-serif; font-size: 24px; font-weight: bold; color: hsl(220, 45%, 15%); margin: 0 0 16px; }
    p { font-size: 15px; color: hsl(220, 15%, 45%); line-height: 1.6; margin: 0 0 16px; }
    .section { background: hsl(215, 65%, 97%); border-radius: 12px; padding: 20px; margin: 20px 0; }
    .section h3 { font-size: 16px; color: hsl(220, 45%, 15%); margin: 0 0 12px; }
    .step { display: flex; gap: 12px; margin-bottom: 12px; }
    .step-num { width: 28px; height: 28px; background: hsl(215, 65%, 25%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; flex-shrink: 0; }
    .step-text { font-size: 14px; color: hsl(220, 15%, 35%); }
    .cta { display: inline-block; background: hsl(215, 65%, 25%); color: hsl(40, 20%, 98%); font-size: 15px; font-weight: bold; border-radius: 12px; padding: 14px 28px; text-decoration: none; margin: 20px 0; }
    .store-link { background: hsl(145, 60%, 95%); border: 1px solid hsl(145, 60%, 80%); border-radius: 8px; padding: 12px 16px; font-family: monospace; font-size: 14px; color: hsl(145, 60%, 25%); word-break: break-all; }
    .footer { font-size: 12px; color: #999; margin-top: 30px; }
    .footer-brand { font-size: 12px; color: hsl(220, 15%, 45%); margin-top: 8px; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://hwkcqgmtinbgyjjgcgmp.supabase.co/storage/v1/object/public/email-assets/steersolo-logo.jpg" width="120" alt="SteerSolo" class="logo" />
    
    <h1>Welcome to SteerSolo, ${name}! 🎉</h1>
    
    <p>Your store <strong>${shopName}</strong> has been created! Here's a quick guide to get you selling fast.</p>

    <div class="section">
      <h3>📋 Your Quick Start Checklist</h3>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text"><strong>Add products</strong> — Upload photos, set prices, and write descriptions. Products with photos sell 5x more!</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text"><strong>Set up payments</strong> — Connect Paystack or add your bank details so customers can pay you instantly.</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text"><strong>Share your store link</strong> — Post it on WhatsApp Status, Instagram bio, and Facebook. One link does it all!</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-text"><strong>Track orders</strong> — Your dashboard shows real-time orders, revenue, and customer activity.</div>
      </div>
    </div>

    <p><strong>🔗 Your store link:</strong></p>
    <div class="store-link">${storeLink}</div>

    <div style="text-align: center;">
      <a href="https://steersolo.com/dashboard" class="cta">Go to My Dashboard →</a>
    </div>

    <div class="section">
      <h3>💡 Pro Tips</h3>
      <p style="margin: 0 0 8px; font-size: 14px;">• Use the <strong>AI Description Generator</strong> to write product descriptions in seconds</p>
      <p style="margin: 0 0 8px; font-size: 14px;">• Create marketing posters with our <strong>built-in Poster Editor</strong></p>
      <p style="margin: 0 0 8px; font-size: 14px;">• Upgrade to Growth or Pro to unlock unlimited products and AI tools</p>
      <p style="margin: 0; font-size: 14px;">• Join our <strong>WhatsApp community</strong> for tips from other vendors</p>
    </div>

    <p>Need help? Reply to this email or visit our <a href="https://steersolo.com/faq" style="color: hsl(215, 65%, 25%);">FAQ page</a>.</p>

    <p class="footer">You're receiving this because you created a store on SteerSolo.</p>
    <p class="footer-brand">SteerSolo — Launch your WhatsApp-powered online store in minutes 🚀</p>
  </div>
</body>
</html>`;

    if (resendKey) {
      const { Resend } = await import("npm:resend@2.0.0");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'SteerSolo <noreply@steersolo.com>',
        to: [profile.email],
        subject: `Welcome to SteerSolo! Here's how to start selling 🚀`,
        html: emailHtml,
      });
    } else {
      console.log(`[DRY RUN] Welcome email to ${profile.email} for shop ${shopName}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Welcome email error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
