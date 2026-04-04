import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { Resend } from 'npm:resend@2.0.0'

import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your email',
  invite: "You've been invited",
  magiclink: 'Your login link',
  recovery: 'Reset your password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

// Template mapping
const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

// Configuration
const SITE_NAME = "SteerSolo"
const SENDER_DOMAIN = "steersolo.com"

// Webhook handler - uses standard Supabase Auth Webhook payload
async function handleWebhook(req: Request): Promise<Response> {
  let paramJson;
  try {
    paramJson = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Support both standard Supabase native hook and old Lovable wrapped payload if they still somehow use it
  let payload: any = paramJson;
  let isNativeSupabase = true;

  if (paramJson.version === "1" && paramJson.data && paramJson.data.action_type) {
    // This is the Lovable format
    isNativeSupabase = false;
    payload = paramJson.data;
  }

  // The email action type (e.g., "signup", "recovery")
  const emailType = isNativeSupabase ? payload.email_data?.email_action_type : payload.action_type;
  
  if (!emailType) {
    console.error('Invalid payload format. Expected email_action_type', paramJson);
    return new Response(JSON.stringify({ error: 'Invalid payload format' }), { 
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  const EmailTemplate = EMAIL_TEMPLATES[emailType];
  if (!EmailTemplate) {
    console.error('Unknown email type', { emailType });
    return new Response(
      JSON.stringify({ error: `Unknown email type: ${emailType}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const recipientEmail = isNativeSupabase ? payload.user?.email : payload.email;
  // Fallback construction for standard Supabase Webhooks without using a customized frontend route
  // The built in confirm path for implicit flow is standard #access_token format 
  const nativeTokenUrl = `${payload.email_data?.site_url ?? 'https://steersolo.com'}#access_token=${payload.email_data?.token_hash}&type=${emailType}`;
  const confirmationUrl = isNativeSupabase ? nativeTokenUrl : payload.url;

  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: `https://${SENDER_DOMAIN}`,
    recipient: recipientEmail,
    confirmationUrl: confirmationUrl,
    token: isNativeSupabase ? payload.email_data?.token : payload.token,
    email: recipientEmail,
    newEmail: isNativeSupabase ? payload.email_data?.token_new : payload.new_email,
  };

  const html = await renderAsync(React.createElement(EmailTemplate, templateProps));
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), {
    plainText: true,
  });

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY environment variable is missing');
    return new Response(JSON.stringify({ error: 'Server misconfiguration: MISSING_RESEND_KEY' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(resendApiKey);

  try {
    const data = await resend.emails.send({
      from: `${SITE_NAME} <noreply@${SENDER_DOMAIN}>`,
      to: [recipientEmail],
      subject: EMAIL_SUBJECTS[emailType] || 'Notification from SteerSolo',
      html,
      text,
    });
    console.log('Email sent successfully', { data });
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to send email via Resend', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    return await handleWebhook(req)
  } catch (error) {
    console.error('Webhook handler error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
