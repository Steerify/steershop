import { Resend } from "npm:resend@2.0.0";
import * as React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";

// Import existing SteerSolo templates
import { SignupEmail } from "./_shared/email-templates/signup.tsx";
import { InviteEmail } from "./_shared/email-templates/invite.tsx";
import { MagicLinkEmail } from "./_shared/email-templates/magic-link.tsx";
import { RecoveryEmail } from "./_shared/email-templates/recovery.tsx";
import { EmailChangeEmail } from "./_shared/email-templates/email-change.tsx";
import { ReauthenticationEmail } from "./_shared/email-templates/reauthentication.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "re_bn6nU67z_MpmejFcumyPi5eLzva2UKMG6");

const RECIPIENT = "okechukwuchukwufulumnanya10@gmail.com";
const FROM = "SteerSolo <onboarding@resend.dev>";

const testEmailTemplates = async () => {
  const templateProps = {
    siteName: "SteerSolo",
    siteUrl: "https://steersolo.com",
    recipient: RECIPIENT,
    confirmationUrl: "https://steersolo.com/auth/callback?test=123",
    token: "123456",
    email: RECIPIENT,
    newEmail: "new-email@example.com",
  };

  const templates = [
    { name: "SignupEmail", Component: SignupEmail, subject: "Confirm your SteerSolo account" },
    { name: "InviteEmail", Component: InviteEmail, subject: "You've been invited to SteerSolo" },
    { name: "MagicLinkEmail", Component: MagicLinkEmail, subject: "Your SteerSolo login link" },
    { name: "RecoveryEmail", Component: RecoveryEmail, subject: "Reset your SteerSolo password" },
    { name: "EmailChangeEmail", Component: EmailChangeEmail, subject: "Confirm your new email" },
    { name: "ReauthenticationEmail", Component: ReauthenticationEmail, subject: "Your verification code" },
  ];

  for (const { name, Component, subject } of templates) {
    console.log(`Sending ${name}...`);
    try {
      const html = await renderAsync(React.createElement(Component, templateProps));
      
      const response = await resend.emails.send({
        from: FROM,
        to: [RECIPIENT],
        subject: `[TEST] ${subject}`,
        html,
      });
      console.log(`✅ ${name} sent successfully. ID: ${response.data?.id}`);
    } catch (e: any) {
      console.error(`❌ Failed to send ${name}:`, e.message || e);
    }
  }

  // Test subscription reminder
  console.log("Sending Subscription Reminder...");
  try {
    const html = `
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
      <p>Hi Test User,</p>
      
      <p>Your subscription for <strong>Test Shop</strong> is expiring on <strong>Next week</strong>.</p>
      
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
        <a href="https://steersolo.com/subscription" class="cta-button">
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
</html>`;
    const response = await resend.emails.send({
      from: FROM,
      to: [RECIPIENT],
      subject: `[TEST] ⏰ Your subscription expires in 3 days - Test Shop`,
      html,
    });
    console.log(`✅ Subscription Reminder sent successfully. ID: ${response.data?.id}`);
  } catch(e: any) {
    console.error(`❌ Failed to send Subscription Reminder:`, e.message || e);
  }

  // Test enforce subscription limits
  console.log("Sending Subscription Limits Deactivation...");
  try {
    const html = `
      <h1>Your shop is currently hidden from the marketplace</h1>
      <p>Hi Test User,</p>
      <p>Your subscription for <strong>Test Shop</strong> expired more than 3 days ago.</p>
      <p>Because your shop has more than 5 products, it has been temporarily removed from the marketplace to comply with our free tier limits.</p>
      <p><strong>To get your shop back online, you can:</strong></p>
      <ul>
        <li><strong>Upgrade your plan:</strong> Choose a subscription that supports your product count.</li>
        <li><strong>Reduce your products:</strong> Remove products until you have 5 or fewer, then reactivate your shop in settings.</li>
      </ul>
      <p><a href="https://steersolo.com/pricing" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Pricing & Plans</a></p>
      <p>Keep growing! 🚀<br>The SteerSolo Team</p>
    `;
    const response = await resend.emails.send({
      from: FROM,
      to: [RECIPIENT],
      subject: `[TEST] ⚠️ Action Required: Your shop "Test Shop" has been hidden`,
      html,
    });
    console.log(`✅ Subscription Limits Deactivation sent successfully. ID: ${response.data?.id}`);
  } catch(e: any) {
    console.error(`❌ Failed to send Subscription Limits Deactivation:`, e.message || e);
  }
};

testEmailTemplates();
