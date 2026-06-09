import * as React from 'react';
import { renderAsync } from '@react-email/components';
import { getTransporter, getDefaultFromEmail } from './_shared/smtp';

import { SignupEmail } from './_shared/email-templates/signup';
import { InviteEmail } from './_shared/email-templates/invite';
import { MagicLinkEmail } from './_shared/email-templates/magic-link';
import { RecoveryEmail } from './_shared/email-templates/recovery';
import { EmailChangeEmail } from './_shared/email-templates/email-change';
import { ReauthenticationEmail } from './_shared/email-templates/reauthentication';

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your SteerSolo account',
  invite: "You've been invited to SteerSolo",
  magiclink: 'Your SteerSolo login link',
  recovery: 'Reset your SteerSolo password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

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

const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
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

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-webhook-secret, content-type',
      }
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const reqSecret = req.headers.get('x-webhook-secret');

    if (webhookSecret && reqSecret !== webhookSecret) {
      console.error('Unauthorized: Invalid or missing x-webhook-secret');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const payload: SupabaseAuthWebhookPayload = await req.json();

    if (!payload.user || !payload.email_data) {
      console.error('Invalid payload structure: missing user or email_data');
      return new Response(JSON.stringify({ error: 'Invalid payload structure' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const emailType = payload.email_data.email_action_type;
    const recipientEmail = payload.user.email;
    console.log(`Received auth event: ${emailType} for ${recipientEmail}`);

    const EmailTemplate = EMAIL_TEMPLATES[emailType];
    if (!EmailTemplate) {
      console.error(`Unknown email type: ${emailType}`);
      return new Response(JSON.stringify({ error: `Unknown email type: ${emailType}` }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const siteUrl = payload.email_data.site_url || `https://${ROOT_DOMAIN}`;
    const confirmationUrl = `${siteUrl}/auth/callback?token_hash=${payload.email_data.token_hash}&type=${emailType}&next=${encodeURIComponent(payload.email_data.redirect_to || siteUrl)}`;

    const templateProps = {
      siteName: SITE_NAME,
      siteUrl: siteUrl,
      recipient: recipientEmail,
      confirmationUrl: confirmationUrl,
      token: payload.email_data.token,
      email: recipientEmail,
      newEmail: payload.email_data.token_new ? 'new_email_placeholder' : '',
    };

    const html = await renderAsync(React.createElement(EmailTemplate, templateProps));
    const text = await renderAsync(React.createElement(EmailTemplate, templateProps), { plainText: true });

    const transporter = await getTransporter();
    const SENDER_EMAIL = getDefaultFromEmail();

    try {
      const info = await transporter.sendMail({
        from: SENDER_EMAIL,
        to: recipientEmail,
        subject: EMAIL_SUBJECTS[emailType] || 'Notification',
        html,
        text,
      });
      console.log(`Auth email sent successfully: ${info.messageId}`);
    } catch (sendError) {
      console.error('Failed to send auth email', sendError);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (emailType === 'signup') {
      try {
        const metadata = payload.user.user_metadata || {};
        const role = typeof metadata.role === 'string' && metadata.role ? metadata.role : 'unknown';
        const fullName = typeof metadata.full_name === 'string' ? metadata.full_name.trim() : 'Not provided';
        const phone = typeof metadata.phone === 'string' && metadata.phone ? metadata.phone : 'Not provided';
        
        const adminSubject = `New signup on SteerSolo: ${recipientEmail}`;
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
        `;
        
        await transporter.sendMail({
          from: SENDER_EMAIL,
          to: ADMIN_SIGNUP_EMAIL,
          subject: adminSubject,
          html: adminHtml,
          text: `New Signup: ${recipientEmail} | Role: ${role}`,
        });
        console.log('Admin signup alert sent successfully');
      } catch (e) {
        console.error('Non-blocking error sending admin signup alert:', e);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
    });
  }
}
