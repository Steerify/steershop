import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { getDefaultFromEmail } from "../_shared/smtp.ts";

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

    const fromEmail = getDefaultFromEmail();

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to SteerSolo</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Poppins', Arial, sans-serif;
      background-color: #0b101c;
      color: #f5f4f2;
      padding: 40px 0;
    }
    .wrapper {
      max-width: 580px;
      margin: 0 auto;
      background: #101623;
      border-radius: 16px;
      border: 1px solid #1f2937;
      overflow: hidden;
      box-shadow: 0 8px 32px -8px rgba(102, 230, 19, 0.12), 0 2px 8px rgba(0,0,0,0.4);
    }
    /* ── Header with Adire dot pattern ── */
    .header {
      background: linear-gradient(135deg, #0b101c 0%, #0d1a12 60%, #0e1f0a 100%);
      padding: 36px 32px 28px;
      text-align: center;
      position: relative;
      border-bottom: 1px solid #1f2937;
      /* Adire-inspired concentric dot pattern */
      background-image:
        radial-gradient(circle at 20% 20%, rgba(102,230,19,0.07) 2px, transparent 2px),
        radial-gradient(circle at 80% 80%, rgba(102,230,19,0.05) 2px, transparent 2px),
        radial-gradient(circle at 50% 50%, rgba(102,230,19,0.04) 1.5px, transparent 1.5px),
        linear-gradient(135deg, #0b101c 0%, #0d1a12 60%, #0e1f0a 100%);
      background-size: 30px 30px, 30px 30px, 20px 20px, 100% 100%;
    }
    .logo { width: 72px; height: auto; margin: 0 auto 16px; display: block; }
    .header h1 {
      font-size: 26px;
      font-weight: 700;
      color: #f5f4f2;
      margin: 0;
      line-height: 1.3;
    }
    .header h1 span { color: #66e613; }
    /* ── Body ── */
    .body { padding: 32px; }
    p { font-size: 15px; color: #d1d5db; line-height: 1.7; margin-bottom: 20px; }
    strong { color: #f5f4f2; }
    /* ── Step checklist ── */
    .checklist {
      background: #0b101c;
      border: 1px solid #1f2937;
      border-left: 3px solid #66e613;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .checklist h3 {
      font-size: 15px;
      font-weight: 600;
      color: #66e613;
      margin: 0 0 18px;
      letter-spacing: 0.5px;
    }
    .step { display: flex; gap: 14px; margin-bottom: 16px; align-items: flex-start; }
    .step:last-child { margin-bottom: 0; }
    .step-num {
      min-width: 28px;
      height: 28px;
      background: #66e613;
      color: #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
      line-height: 1;
    }
    .step-text { font-size: 14px; color: #9ca3af; line-height: 1.6; padding-top: 4px; }
    .step-text strong { color: #f5f4f2; }
    /* ── Store link ── */
    .store-link-wrap { margin: 24px 0; }
    .store-link-label { font-size: 13px; color: #9ca3af; margin-bottom: 8px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; }
    .store-link {
      background: #0b101c;
      border: 1px dashed #66e613;
      border-radius: 10px;
      padding: 14px 18px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #66e613;
      word-break: break-all;
    }
    /* ── CTA ── */
    .cta-wrap { text-align: center; margin: 28px 0 24px; }
    .cta {
      display: inline-block;
      background: #66e613;
      color: #000;
      font-size: 16px;
      font-weight: 700;
      border-radius: 12px;
      padding: 16px 36px;
      text-decoration: none;
      letter-spacing: 0.3px;
    }
    /* ── Pro tips ── */
    .tips {
      background: #0b101c;
      border: 1px solid #1f2937;
      border-radius: 12px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .tips h3 { font-size: 14px; font-weight: 600; color: #f5f4f2; margin: 0 0 14px; }
    .tip { font-size: 14px; color: #9ca3af; margin-bottom: 10px; padding-left: 8px; border-left: 2px solid #1f2937; }
    .tip:last-child { margin-bottom: 0; }
    /* ── Footer ── */
    .footer {
      border-top: 1px solid #1f2937;
      padding: 20px 32px;
      text-align: center;
    }
    .footer p { font-size: 12px; color: #6b7280; margin: 0 0 6px; }
    .footer .brand { color: #66e613; font-style: italic; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="https://steersolo.com/email-logo.jpg" alt="SteerSolo" class="logo" />
      <h1>Welcome to <span>SteerSolo</span>, ${name}! 🎉</h1>
    </div>

    <div class="body">
      <p>Your store <strong>${shopName}</strong> is live! Here's your quick-start guide to getting your first sale.</p>

      <div class="checklist">
        <h3>📋 Your Quick-Start Checklist</h3>
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text"><strong>Add products</strong> — Upload photos, set prices, write descriptions. Products with photos sell 5× more!</div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text"><strong>Set up payments</strong> — Connect Paystack or add your bank details so customers can pay instantly.</div>
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

      <div class="store-link-wrap">
        <p class="store-link-label">🔗 Your store link</p>
        <div class="store-link">${storeLink}</div>
      </div>

      <div class="cta-wrap">
        <a href="https://steersolo.com/dashboard" class="cta">Go to My Dashboard →</a>
      </div>

      <div class="tips">
        <h3>💡 Pro Tips</h3>
        <div class="tip">Use the <strong>AI Description Generator</strong> to write product descriptions in seconds</div>
        <div class="tip">Create marketing posters with our <strong>built-in Poster Editor</strong></div>
        <div class="tip">Upgrade to Growth or Pro to unlock unlimited products and AI tools</div>
        <div class="tip">Join our <strong>WhatsApp community</strong> for tips from other vendors</div>
      </div>

      <p>Need help? Reply to this email or visit our <a href="https://steersolo.com/faq" style="color:#66e613;text-decoration:none;">FAQ page</a>.</p>
    </div>

    <div class="footer">
      <p>You're receiving this because you created a store on SteerSolo.</p>
      <p class="brand">SteerSolo — Launch your WhatsApp-powered online store in minutes 🚀</p>
    </div>
  </div>
</body>
</html>`;

    // Enqueue welcome email
    const message_id = crypto.randomUUID()
    const { error: queueErr } = await (serviceClient as any).rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id,
        label: 'welcome-email',
        to: profile.email,
        from: fromEmail,
        replyTo: 'mail@steersolo.com',
        subject: `Welcome to SteerSolo! Here's how to start selling 🚀`,
        html: emailHtml,
        queued_at: new Date().toISOString(),
      },
    })
    if (queueErr) {
      console.error('Failed to enqueue welcome email:', queueErr)
      throw new Error(queueErr.message || 'Failed to enqueue email')
    }
    try {
      await (serviceClient as any).from('email_send_log').insert({
        message_id,
        template_name: 'welcome-email',
        recipient_email: profile.email,
        status: 'pending',
      })
    } catch (e) {
      console.warn('email_send_log pending insert failed (non-fatal):', e)
    }
    console.log('Welcome email enqueued successfully:', message_id)

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
