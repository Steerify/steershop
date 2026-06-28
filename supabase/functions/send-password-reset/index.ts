import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getDefaultFromEmail } from "../_shared/smtp.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  name?: string;
  resetLink: string;
}

const generateEmailHtml = (name: string, resetLink: string): string => {
  const displayName = name || "there";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - SteerSolo</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Gold Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AF37, #C5A028); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">SteerSolo</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Your Business, Your Way</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hi ${displayName},
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your SteerSolo account. Click the button below to create a new, secure password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${resetLink}" 
                       style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #C5A028); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Link fallback -->
              <p style="margin: 0 0 20px 0; color: #888888; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px 0; word-break: break-all; background-color: #f8f8f8; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #D4AF37;">
                ${resetLink}
              </p>
              
              <!-- Security Notice -->
              <div style="background-color: #FFF9E6; border-left: 4px solid #D4AF37; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
                <p style="margin: 0; color: #8B6914; font-size: 14px; line-height: 1.5;">
                  <strong>🔒 Security Notice:</strong><br>
                  This link expires in 1 hour. If you didn't request this password reset, you can safely ignore this email. Your account remains secure.
                </p>
              </div>
              
              <p style="margin: 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Stay secure,<br>
                <strong style="color: #D4AF37;">The SteerSolo Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px 0; color: #888888; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@steersolo.com" style="color: #D4AF37; text-decoration: none;">support@steersolo.com</a>
              </p>
              <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
                © ${new Date().getFullYear()} SteerSolo. All rights reserved.<br>
                Lagos, Nigeria
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Legal Footer -->
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 11px; line-height: 1.5;">
                You're receiving this email because a password reset was requested for your SteerSolo account.
                If you didn't make this request, no action is needed.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Password reset email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, resetLink }: PasswordResetRequest = await req.json();
    
    console.log(`Sending password reset email to: ${email}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const fromEmail = getDefaultFromEmail();

    // Enqueue password reset email
    const message_id = crypto.randomUUID()
    const { error: queueErr } = await (supabase as any).rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id,
        label: 'password-reset',
        to: email,
        from: fromEmail,
        replyTo: 'mail@steersolo.com',
        subject: "Reset Your Password - SteerSolo",
        html: generateEmailHtml(name || "", resetLink),
        queued_at: new Date().toISOString(),
      },
    })
    if (queueErr) {
      console.error('Failed to enqueue password reset email:', queueErr)
      throw new Error(queueErr.message || 'Failed to enqueue email')
    }
    try {
      await (supabase as any).from('email_send_log').insert({
        message_id,
        template_name: 'password-reset',
        recipient_email: email,
        status: 'pending',
      })
    } catch (e) {
      console.warn('email_send_log pending insert failed (non-fatal):', e)
    }
    console.log('Password reset email enqueued successfully:', message_id)

    return new Response(JSON.stringify({ success: true, message_id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
