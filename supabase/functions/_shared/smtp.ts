import nodemailer from "npm:nodemailer";

export interface SmtpMailOptions {
  from?: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export function getDefaultFromEmail(): string {
  // If using Resend without a verified domain, you might need to use onboarding@resend.dev to test
  return (Deno.env.get("SMTP_FROM_EMAIL") || "SteerSolo <no-reply@steersolo.com>").trim();
}

/**
 * Creates and returns the primary transporter.
 * We default to using the Resend REST API for the most professional and reliable delivery.
 * If RESEND_API_KEY is not provided, we fall back to standard SMTP if credentials exist.
 */
export async function getTransporter() {
  // Use environment variable if available, otherwise use the provided standard key
  const resendApiKey = (Deno.env.get("RESEND_API_KEY") || "re_bn6nU67z_MpmejFcumyPi5eLzva2UKMG6").trim();

  // 1. Professional Resend API Transport
  if (resendApiKey) {
    return {
      sendMail: async (options: any) => {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: options.from || getDefaultFromEmail(),
            to: Array.isArray(options.to) ? options.to : [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text,
            reply_to: options.replyTo,
          })
        });

        if (!res.ok) {
          const error = await res.text();
          console.error("Resend API error:", error);
          throw new Error(`Resend API error: ${error}`);
        }
        const data = await res.json();
        return { messageId: data.id };
      }
    };
  }

  // 2. Standard SMTP Fallback
  const host = (Deno.env.get("SMTP_HOST") || "").trim();
  const port = Number((Deno.env.get("SMTP_PORT") || "465").trim());
  const user = Deno.env.get("SMTP_USER")?.trim();
  const pass = Deno.env.get("SMTP_PASS")?.trim();

  if (host && user && pass) {
    const primaryTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    
    try {
      await primaryTransporter.verify();
      return primaryTransporter;
    } catch (error) {
      console.error("⚠️ Primary SMTP verification failed:", error);
      throw error;
    }
  }

  throw new Error("No email service configured. Please set RESEND_API_KEY in your Supabase project secrets to handle emails professionally.");
}

export function normalizeRecipients(to: string | string[] | unknown): string[] {
  if (Array.isArray(to)) {
    return to.filter((recipient): recipient is string => typeof recipient === "string" && recipient.trim().length > 0);
  }
  if (typeof to === "string" && to.trim().length > 0) {
    return [to];
  }
  return [];
}

export async function sendSmtpEmail(options: SmtpMailOptions) {
  const recipients = normalizeRecipients(options.to);
  if (recipients.length === 0) {
    throw new Error("Missing email recipient");
  }

  const transporter = await getTransporter();

  try {
    const info = await transporter.sendMail({
      from: options.from || getDefaultFromEmail(),
      to: recipients,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    
    return info;
  } catch (error) {
    console.error("Email sending failed", error);
    throw error;
  }
}
