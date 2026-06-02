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
  return (Deno.env.get("SMTP_FROM_EMAIL") || "SteerSolo <no-reply@steersolo.com>").trim();
}

/**
 * Creates and returns the primary nodemailer transporter.
 * If SMTP credentials are missing, or if verification fails, it returns a 
 * fallback transporter that logs to the console (useful for dev/test).
 */
export async function getTransporter() {
  const host = (Deno.env.get("SMTP_HOST") || "mail.spacemail.com").trim();
  const port = Number((Deno.env.get("SMTP_PORT") || "465").trim());
  const user = Deno.env.get("SMTP_USER")?.trim();
  const pass = Deno.env.get("SMTP_PASS")?.trim();

  const fallbackTransporter = nodemailer.createTransport({
    streamTransport: true,
    newline: "windows",
    logger: true
  });

  if (!user || !pass) {
    console.warn("⚠️ SMTP_USER or SMTP_PASS missing. Falling back to console stream transport.");
    return fallbackTransporter;
  }

  const primaryTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
  });

  try {
    await primaryTransporter.verify();
    return primaryTransporter;
  } catch (error) {
    console.error("⚠️ Primary SMTP verification failed. Falling back to console stream transport:", error);
    return fallbackTransporter;
  }
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
    
    // If it's a stream transport (fallback), it returns a message object we can read
    if (info.message) {
      info.message.pipe(process.stdout);
    }
    
    return info;
  } catch (error) {
    console.error("SMTP sending failed", error);
    throw error;
  }
}
