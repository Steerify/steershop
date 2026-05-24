import nodemailer from "npm:nodemailer";

export interface SmtpMailOptions {
  from?: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export interface SmtpSendResult {
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  response?: string;
  provider?: string;
}

type ProviderConfig = {
  name: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
};

export function getDefaultFromEmail(): string {
  return Deno.env.get("SMTP_FROM_EMAIL") ||
    Deno.env.get("MAIL_FROM") ||
    "SteerSolo <mail@steersolo.com>";
}

export function assertSmtpConfigured(): {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
} {
  const host = Deno.env.get("SMTP_HOST");
  const port = Number(Deno.env.get("SMTP_PORT") || "465");
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASS");

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS)");
  }

  return {
    host,
    port,
    user,
    pass,
    secure: port === 465,
  };
}

function createSmtpTransporter() {
  const smtp = assertSmtpConfigured();
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });
}

function readProviderConfig(prefix: "SPACEMAIL" | "BREVO"): ProviderConfig | null {
  const host = Deno.env.get(`${prefix}_SMTP_HOST`);
  const user = Deno.env.get(`${prefix}_SMTP_USER`);
  const pass = Deno.env.get(`${prefix}_SMTP_PASS`);
  if (!host || !user || !pass) return null;
  const port = Number(Deno.env.get(`${prefix}_SMTP_PORT`) || "465");
  return { name: prefix.toLowerCase(), host, port, user, pass, secure: port === 465 };
}

function resolveProviderOrder(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  const primary = Deno.env.get("EMAIL_PRIMARY_PROVIDER")?.toLowerCase();
  const spacemail = readProviderConfig("SPACEMAIL");
  const brevo = readProviderConfig("BREVO");
  if (primary === "brevo") {
    if (brevo) providers.push(brevo);
    if (spacemail) providers.push(spacemail);
  } else {
    if (spacemail) providers.push(spacemail);
    if (brevo) providers.push(brevo);
  }

  if (providers.length === 0) {
    const smtp = assertSmtpConfigured();
    providers.push({ name: "smtp", ...smtp });
  }
  return providers;
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

export async function sendSmtpEmail(options: SmtpMailOptions): Promise<SmtpSendResult> {
  const recipients = normalizeRecipients(options.to);
  if (recipients.length === 0) {
    throw new Error("Missing email recipient");
  }

  let lastError: unknown = null;
  for (const provider of resolveProviderOrder()) {
    try {
      const transporter = nodemailer.createTransport({
        host: provider.host,
        port: provider.port,
        secure: provider.secure,
        auth: { user: provider.user, pass: provider.pass },
      });
      const info = await transporter.sendMail({
        from: options.from || getDefaultFromEmail(),
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return {
        messageId: info.messageId,
        accepted: Array.isArray(info.accepted) ? info.accepted.map(String) : undefined,
        rejected: Array.isArray(info.rejected) ? info.rejected.map(String) : undefined,
        response: typeof info.response === "string" ? info.response : undefined,
        provider: provider.name,
      };
    } catch (error) {
      lastError = error;
      console.error("SMTP provider failed", { provider: provider.name, error: error instanceof Error ? error.message : String(error) });
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All SMTP providers failed");
}

export function formatQueuedSender(payload: { from?: unknown; sender_domain?: unknown }): string {
  if (typeof payload.sender_domain === "string" && payload.sender_domain.trim()) {
    const displayName = typeof payload.from === "string" && payload.from.includes("<")
      ? payload.from.split("<")[0].trim()
      : "SteerSolo";
    return `${displayName} <noreply@${payload.sender_domain.trim()}>`;
  }

  return typeof payload.from === "string" && payload.from.trim()
    ? payload.from
    : getDefaultFromEmail();
}
