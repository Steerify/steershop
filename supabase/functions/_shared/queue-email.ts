// Shared helper to enqueue transactional emails into the durable pgmq queue.
// All transactional sends should route through this so they get retries,
// rate-limit handling, and DLQ via process-email-queue.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

export interface QueueEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  label?: string; // logical template name for email_send_log
}

const DEFAULT_FROM = "SteerSolo <noreply@steersolo.com>";
const QUEUE_NAME = "transactional_emails";

export async function enqueueTransactionalEmail(
  supabase: SupabaseClient,
  input: QueueEmailInput
): Promise<{ message_id: string; queued: boolean }> {
  const message_id = crypto.randomUUID();
  const payload = {
    message_id,
    label: input.label || "transactional",
    to: input.to,
    from: input.from || DEFAULT_FROM,
    subject: input.subject,
    html: input.html,
    text: input.text,
    queued_at: new Date().toISOString(),
  };

  const { error } = await (supabase as any).rpc("enqueue_email", {
    queue_name: QUEUE_NAME,
    payload,
  });

  if (error) {
    console.error("enqueue_email failed", { error, label: input.label });
    throw new Error(`Failed to enqueue email: ${error.message}`);
  }

  // Best-effort initial log; queue dispatcher will append 'sent' / 'failed' rows later.
  try {
    await (supabase as any).from("email_send_log").insert({
      message_id,
      template_name: input.label || "transactional",
      recipient_email: Array.isArray(input.to) ? input.to[0] : input.to,
      status: "pending",
    });
  } catch (e) {
    console.warn("email_send_log pending insert failed (non-fatal)", e);
  }

  return { message_id, queued: true };
}

export function makeServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}
