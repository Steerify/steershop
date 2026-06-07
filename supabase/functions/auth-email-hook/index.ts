import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { getTransporter, getDefaultFromEmail } from '../_shared/smtp.ts'

// Import existing SteerSolo templates
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-webhook-secret, content-type',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your SteerSolo account',
  invite: "You've been invited to SteerSolo",
  magiclink: 'Your SteerSolo login link',
  recovery: 'Reset your SteerSolo password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

// Native Supabase Custom Auth Webhook Payload
interface SupabaseAuthWebhookPayload {
  user: {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

interface AuthEmailTemplateProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token: string
  email: string
  newEmail: string
}

const EMAIL_TEMPLATES: Record<string, React.ComponentType<AuthEmailTemplateProps>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

const SITE_NAME = "SteerSolo"
const ROOT_DOMAIN = "steersolo.com"
const ADMIN_SIGNUP_EMAIL = "steerifygroup@gmail.com"

async function handleWebhook(req: Request): Promise<Response> {
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
  const reqSecret = req.headers.get('x-webhook-secret')

  // If a secret is configured, enforce it; otherwise allow requests (dev mode)
  if (webhookSecret && reqSecret !== webhookSecret) {
    console.error('Unauthorized: Invalid or missing x-webhook-secret')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let payload: SupabaseAuthWebhookPayload
  try {
    payload = await req.json()
  } catch (error) {
    console.error('Invalid JSON payload', error)
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!payload.user || !payload.email_data) {
    console.error('Invalid payload structure: missing user or email_data')
    return new Response(JSON.stringify({ error: 'Invalid payload structure' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const emailType = payload.email_data.email_action_type
  const recipientEmail = payload.user.email
  console.log(`Received auth event: ${emailType} for ${recipientEmail}`)

  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate) {
    console.error(`Unknown email type: ${emailType}`)
    return new Response(JSON.stringify({ error: `Unknown email type: ${emailType}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Construct standard Supabase PKCE confirmation URL
  const siteUrl = payload.email_data.site_url || `https://${ROOT_DOMAIN}`
  const confirmationUrl = `${siteUrl}/auth/callback?token_hash=${payload.email_data.token_hash}&type=${emailType}&next=${encodeURIComponent(payload.email_data.redirect_to || siteUrl)}`

  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: siteUrl,
    recipient: recipientEmail,
    confirmationUrl: confirmationUrl,
    token: payload.email_data.token,
    email: recipientEmail,
    newEmail: payload.email_data.token_new ? 'new_email_placeholder' : '',
  }

  const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), { plainText: true })

  const transporter = await getTransporter();
  const SENDER_EMAIL = getDefaultFromEmail();

  // 1. Send the primary auth email to the user
  try {
    const info = await transporter.sendMail({
      from: SENDER_EMAIL,
      to: recipientEmail,
      subject: EMAIL_SUBJECTS[emailType] || 'Notification',
      html,
      text,
    })
    console.log(`Auth email sent successfully: ${info.messageId}`)
  } catch (sendError) {
    console.error('Failed to send auth email', sendError)
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 2. Admin-only logic for 'signup'. Do not send supplemental user-facing
  // onboarding emails here; signup users should only receive the verification
  // email from this auth hook. The onboarding welcome is queued after email
  // confirmation by a database trigger.
  if (emailType === 'signup') {
    try {
      const metadata = payload.user.user_metadata || {}
      const role = typeof metadata.role === 'string' && metadata.role ? metadata.role : 'unknown'
      const fullName = typeof metadata.full_name === 'string' ? metadata.full_name.trim() : 'Not provided'
      const phone = typeof metadata.phone === 'string' && metadata.phone ? metadata.phone : 'Not provided'
      
      const adminSubject = `New signup on SteerSolo: ${recipientEmail}`
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 16px;">
          <h2 style="margin: 0 0 12px; color: #123C72;">New SteerSolo Registration</h2>
          <table style="border-collapse: collapse; width: 100%; border: 1px solid #E4E7EC;">
            <tbody>
              <tr><td style="padding: 10px; border-bottom: 1px solid #E4E7EC; font-weight: 700;">Email</td><td style="padding: 10px; border-bottom: 1px solid #E4E7EC;">${recipientEmail}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #E4E7EC; font-weight: 700;">Name</td><td style="padding: 10px; border-bottom: 1px solid #E4E7EC;">${fullName}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #E4E7EC; font-weight: 700;">Phone</td><td style="padding: 10px; border-bottom: 1px solid #E4E7EC;">${phone}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #E4E7EC; font-weight: 700;">Role</td><td style="padding: 10px; border-bottom: 1px solid #E4E7EC;">${role}</td></tr>
            </tbody>
          </table>
        </div>
      `
      
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: ADMIN_SIGNUP_EMAIL,
        subject: adminSubject,
        html: adminHtml,
        text: `New Signup: ${recipientEmail} | Role: ${role}`,
      })
      console.log('Admin signup alert sent successfully')
    } catch (e) {
      console.error('Non-blocking error sending admin signup alert:', e)
    }
  }

  return new Response(JSON.stringify({ success: true }), { 
    status: 200, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    return await handleWebhook(req)
  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
