import { createClient } from 'npm:@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer'

const MAX_RETRIES = 5
const DEFAULT_BATCH_SIZE = 10
const DEFAULT_SEND_DELAY_MS = 200
const DEFAULT_AUTH_TTL_MINUTES = 15
const DEFAULT_TRANSACTIONAL_TTL_MINUTES = 60

function buildProviders() {
  const read = (prefix: 'SPACEMAIL' | 'BREVO' | 'SUPABASE') => {
    const host = Deno.env.get(`${prefix}_SMTP_HOST`)
    const user = Deno.env.get(`${prefix}_SMTP_USER`)
    const pass = Deno.env.get(`${prefix}_SMTP_PASS`)
    if (!host || !user || !pass) return null
    const port = Number(Deno.env.get(`${prefix}_SMTP_PORT`) || '465')
    return { name: prefix.toLowerCase(), host, port, secure: port === 465, user, pass }
  }
  const primary = Deno.env.get('EMAIL_PRIMARY_PROVIDER')?.toLowerCase()
  const spacemail = read('SPACEMAIL')
  const brevo = read('BREVO')
  const supabase = read('SUPABASE')
  const providers = [] as Array<{ name: string; host: string; port: number; secure: boolean; user: string; pass: string }>
  if (primary === 'brevo') {
    if (brevo) providers.push(brevo)
    if (spacemail) providers.push(spacemail)
  } else {
    if (spacemail) providers.push(spacemail)
    if (brevo) providers.push(brevo)
  }

  if (providers.length === 0) {
    const host = Deno.env.get('SMTP_HOST')
    const user = Deno.env.get('SMTP_USER')
    const pass = Deno.env.get('SMTP_PASS')
    const port = Number(Deno.env.get('SMTP_PORT') || '465')
    if (host && user && pass) providers.push({ name: 'smtp', host, port, secure: port === 465, user, pass })
  }
  if (supabase) providers.push(supabase)
  return providers
}

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null
  if ('status' in error && typeof (error as { status: unknown }).status === 'number') {
    return (error as { status: number }).status
  }
  if ('responseCode' in error && typeof (error as { responseCode: unknown }).responseCode === 'number') {
    return (error as { responseCode: number }).responseCode
  }
  return null
}

function isRateLimited(error: unknown): boolean {
  return getErrorStatus(error) === 429 || (error instanceof Error && error.message.includes('429'))
}

function isForbidden(error: unknown): boolean {
  return getErrorStatus(error) === 403 || (error instanceof Error && error.message.includes('403'))
}

function getRetryAfterSeconds(error: unknown): number {
  if (error && typeof error === 'object' && 'retryAfterSeconds' in error) {
    return (error as { retryAfterSeconds: number | null }).retryAfterSeconds ?? 60
  }
  return 60
}

function parseJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const payload = parts[1]
      .replaceAll('-', '+')
      .replaceAll('_', '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=')
    return JSON.parse(atob(payload)) as Record<string, unknown>
  } catch {
    return null
  }
}

async function moveToDlq(
  supabase: any,
  queue: string,
  msg: { msg_id: number; message: Record<string, unknown> },
  reason: string
): Promise<void> {
  const payload = msg.message
  await (supabase as any).from('email_send_log').insert({
    message_id: payload.message_id,
    template_name: (payload.label || queue) as string,
    recipient_email: payload.to,
    status: 'dlq',
    error_message: reason,
  })
  const { error } = await (supabase as any).rpc('move_to_dlq', {
    source_queue: queue,
    dlq_name: `${queue}_dlq`,
    message_id: msg.msg_id,
    payload,
  })
  if (error) {
    console.error('Failed to move message to DLQ', { queue, msg_id: msg.msg_id, reason, error })
  }
}

Deno.serve(async (req) => {
    const smtpFromEmail = Deno.env.get('SMTP_FROM_EMAIL') || 'mail@steersolo.com'
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const token = authHeader.slice('Bearer '.length).trim()
  const claims = parseJwtClaims(token)
  if (claims?.role !== 'service_role') {
    return new Response(
      JSON.stringify({ error: 'Forbidden' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const smtpProviders = buildProviders()

  const { data: state } = await (supabase as any)
    .from('email_send_state')
    .select('retry_after_until, batch_size, send_delay_ms, auth_email_ttl_minutes, transactional_email_ttl_minutes')
    .single()

  if (state?.retry_after_until && new Date(state.retry_after_until) > new Date()) {
    return new Response(
      JSON.stringify({ skipped: true, reason: 'rate_limited' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const batchSize = state?.batch_size ?? DEFAULT_BATCH_SIZE
  const sendDelayMs = state?.send_delay_ms ?? DEFAULT_SEND_DELAY_MS
  const ttlMinutes: Record<string, number> = {
    auth_emails: state?.auth_email_ttl_minutes ?? DEFAULT_AUTH_TTL_MINUTES,
    transactional_emails: state?.transactional_email_ttl_minutes ?? DEFAULT_TRANSACTIONAL_TTL_MINUTES,
  }

  let totalProcessed = 0

  for (const queue of ['auth_emails', 'transactional_emails']) {
    const { data: messages, error: readError } = await (supabase as any).rpc('read_email_batch', {
      queue_name: queue,
      batch_size: batchSize,
      vt: 30,
    })

    if (readError) {
      console.error('Failed to read email batch', { queue, error: readError })
      continue
    }

    if (!messages?.length) continue

    const messageIds = Array.from(
      new Set(
        messages
          .map((msg: any) =>
            msg?.message?.message_id && typeof msg.message.message_id === 'string'
              ? msg.message.message_id
              : null
          )
          .filter((id: any): id is string => Boolean(id))
      )
    )
    const failedAttemptsByMessageId = new Map<string, number>()
    if (messageIds.length > 0) {
      const { data: failedRows, error: failedRowsError } = await (supabase as any)
        .from('email_send_log')
        .select('message_id')
        .in('message_id', messageIds)
        .eq('status', 'failed')

      if (failedRowsError) {
        console.error('Failed to load failed-attempt counters', { queue, error: failedRowsError })
      } else {
        for (const row of failedRows ?? []) {
          const messageId = row?.message_id
          if (typeof messageId !== 'string' || !messageId) continue
          failedAttemptsByMessageId.set(
            messageId,
            (failedAttemptsByMessageId.get(messageId) ?? 0) + 1
          )
        }
      }
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      const payload = msg.message
      const failedAttempts =
        payload?.message_id && typeof payload.message_id === 'string'
          ? (failedAttemptsByMessageId.get(payload.message_id) ?? 0)
          : 0

      if (payload.queued_at) {
        const ageMs = Date.now() - new Date(payload.queued_at).getTime()
        const maxAgeMs = ttlMinutes[queue] * 60 * 1000
        if (ageMs > maxAgeMs) {
          console.warn('Email expired (TTL exceeded)', {
            queue, msg_id: msg.msg_id, queued_at: payload.queued_at, ttl_minutes: ttlMinutes[queue],
          })
          await moveToDlq(supabase, queue, msg, `TTL exceeded (${ttlMinutes[queue]} minutes)`)
          continue
        }
      }

      if (failedAttempts >= MAX_RETRIES) {
        await moveToDlq(supabase, queue, msg, `Max retries (${MAX_RETRIES}) exceeded (attempted ${failedAttempts} times)`)
        continue
      }

      if (payload.message_id) {
        const { data: alreadySentByMessageId } = await (supabase as any)
          .from('email_send_log')
          .select('id')
          .eq('message_id', payload.message_id)
          .eq('status', 'sent')
          .maybeSingle()
        const { data: alreadySentByQueueMessageId } = await (supabase as any)
          .from('email_send_log')
          .select('id')
          .contains('metadata', { queue_message_id: payload.message_id })
          .eq('status', 'sent')
          .maybeSingle()

        if (alreadySentByMessageId || alreadySentByQueueMessageId) {
          console.warn('Skipping duplicate send (already sent)', {
            queue, msg_id: msg.msg_id, message_id: payload.message_id,
          })
          const { error: dupDelError } = await (supabase as any).rpc('delete_email', {
            queue_name: queue,
            message_id: msg.msg_id,
          })
          if (dupDelError) {
            console.error('Failed to delete duplicate message from queue', { queue, msg_id: msg.msg_id, error: dupDelError })
          }
          continue
        }
      }

      try {
        if (smtpProviders.length === 0) {
          throw new Error('Missing SMTP environment variables. Emails cannot be sent.')
        }

        let sendResult: any = null
        let sentProvider = 'unknown'
        let lastError: unknown = null
        for (const provider of smtpProviders) {
          try {
            const transporter = nodemailer.createTransport({
              host: provider.host,
              port: provider.port,
              secure: provider.secure,
              auth: { user: provider.user, pass: provider.pass },
            })
            sendResult = await transporter.sendMail({
              from: payload.from || `SteerSolo <${smtpFromEmail}>`,
              to: payload.to,
              subject: payload.subject,
              html: payload.html,
              text: payload.text,
              replyTo: 'mail@steersolo.com',
            })
            sentProvider = provider.name
            break
          } catch (providerError) {
            lastError = providerError
            console.error('Provider send failed', { provider: provider.name, msg_id: msg.msg_id, error: providerError instanceof Error ? providerError.message : String(providerError) })
          }
        }
        if (!sendResult) throw (lastError instanceof Error ? lastError : new Error('All providers failed'))

        await (supabase as any).from('email_send_log').insert({
          message_id: sendResult?.messageId || payload.message_id,
          template_name: payload.label || queue,
          recipient_email: payload.to,
          status: 'sent',
          metadata: sendResult?.messageId ? { queue_message_id: payload.message_id, provider: sentProvider } : { provider: sentProvider },
        })

        const { error: delError } = await (supabase as any).rpc('delete_email', {
          queue_name: queue,
          message_id: msg.msg_id,
        })
        if (delError) {
          console.error('Failed to delete sent message from queue', { queue, msg_id: msg.msg_id, error: delError })
        }
        totalProcessed++
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error('Email send failed', {
          queue, msg_id: msg.msg_id, read_ct: msg.read_ct, failed_attempts: failedAttempts, error: errorMsg,
        })

        if (isRateLimited(error)) {
          await (supabase as any).from('email_send_log').insert({
            message_id: payload.message_id,
            template_name: payload.label || queue,
            recipient_email: payload.to,
            status: 'rate_limited',
            error_message: errorMsg.slice(0, 1000),
          })

          const retryAfterSecs = getRetryAfterSeconds(error)
          await (supabase as any)
            .from('email_send_state')
            .update({
              retry_after_until: new Date(Date.now() + retryAfterSecs * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', 1)

          return new Response(
            JSON.stringify({ processed: totalProcessed, stopped: 'rate_limited' }),
            { headers: { 'Content-Type': 'application/json' } }
          )
        }

        if (isForbidden(error)) {
          await moveToDlq(supabase, queue, msg, 'Email service disabled for this project')
          return new Response(
            JSON.stringify({ processed: totalProcessed, stopped: 'emails_disabled' }),
            { headers: { 'Content-Type': 'application/json' } }
          )
        }

        await (supabase as any).from('email_send_log').insert({
          message_id: payload.message_id,
          template_name: payload.label || queue,
          recipient_email: payload.to,
          status: 'failed',
          error_message: errorMsg.slice(0, 1000),
        })
        if (payload?.message_id && typeof payload.message_id === 'string') {
          failedAttemptsByMessageId.set(payload.message_id, failedAttempts + 1)
        }
      }

      if (i < messages.length - 1) {
        await new Promise((r) => setTimeout(r, sendDelayMs))
      }
    }
  }

  return new Response(
    JSON.stringify({ processed: totalProcessed }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
