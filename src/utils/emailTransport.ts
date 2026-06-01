import nodemailer from "npm:nodemailer";

// Primary transport – points to mail.steersolo.com (or fallback to local MailHog if env vars are missing)
export const primaryTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "mail.steersolo.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false, // TLS optional on port 587
  auth: {
    user: process.env.SMTP_USER ?? "test_user",
    pass: process.env.SMTP_PASS ?? "test_pass",
  },
});

// Fallback transport – uses system sendmail (works on most Linux/macOS environments)
export const fallbackTransport = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

/**
 * Returns a transporter that is verified. If the primary transport cannot be verified,
 * the fallback sendmail transport is returned.
 */
export async function getTransport() {
  try {
    await primaryTransport.verify();
    return primaryTransport;
  } catch (e) {
    console.warn("Primary SMTP verification failed, falling back to sendmail:", e);
    return fallbackTransport;
  }
}
