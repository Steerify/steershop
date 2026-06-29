# SteerShop — Email Reliability + High-Priority UI/UX Fixes

## Context
Vite + React + TS e-commerce app (Supabase backend, Paystack, Resend/SMTP email).
Scope agreed with user:
- **Email:** Code + migration fixes only (user handles deploy/secrets).
- **UI/UX:** High-priority issues only (7 items).

---

## Part A — Email Services

### Root cause (critical)
`supabase/migrations/20260405151210_email_infra.sql` only **documents** the pg_cron job
that calls `process-email-queue` (lines 279–293 are comments). The actual
`cron.schedule(...)` + vault secret SQL was never written, so **queued emails are
never dispatched automatically**. Everything enqueues fine but nothing drains the queue.

### A1. New migration: schedule the queue processor
Create `supabase/migrations/<timestamp>_schedule_process_email_queue.sql` that:
- Stores the service-role key in vault as `email_queue_service_role_key`
  (`vault.create_secret`, idempotent — wrapped to update if exists).
- Creates pg_cron job `process-email-queue` running every ~10s (or 1 min) that:
  - checks `email_send_state.retry_after_until` cooldown,
  - checks `pgmq` queues `auth_emails`/`transactional_emails` for pending msgs,
  - calls the edge function via `net.http_post` with the vault key as Bearer.
- Idempotent: `cron.unschedule` if exists before re-scheduling.
- NOTE: the project ref/URL is hardcoded-safe (`hwkcqgmtinbgyjjgcgmp`); use it in the URL.
- Include a comment that the service-role key must be inserted by the user (can't be
  in source). Provide a clearly-marked placeholder + instructions.

### A2. Remove hardcoded Resend API key (security)
- `supabase/functions/_shared/smtp.ts:24` — remove fallback literal
  `re_bn6nU67z_...`; require `RESEND_API_KEY` env or fall through to SMTP/throw.
- `api/_shared/smtp.ts` — same fix.

### A3. Convert direct-send functions to the queue (reliability)
These bypass the queue (no retries/logging):
- `supabase/functions/subscription-reminder/index.ts` (uses `new Resend().emails.send`)
- `supabase/functions/enforce-subscription-limits/index.ts`
Change them to enqueue via the shared `enqueue_email` RPC / `queue-email.ts` helper,
matching the pattern used by `send-notification-email`. (Keeps one delivery path.)

### A4. Harden Node webhook auth (defense)
- `api/auth-email-hook.ts` — webhook secret check is skipped when env unset.
  Make `WEBHOOK_SECRET` required; reject when missing/mismatched.

### A5. Fix concierge cron template placeholder (minor, while here)
- `supabase/crons/concierge_generate_2h.sql:8` still has
  `YOUR_SUPABASE_PROJECT_REF`. Replace with real ref so the job actually works.

### Out of scope (user deploys): `npx supabase functions deploy`, setting secrets,
running the migration, inserting the vault service-role key.

---

## Part B — High-Priority UI/UX (7)

1. **Hero decorative image** `src/pages/Index.tsx:730` — `alt=""` →
   add `aria-hidden="true"` (keep empty alt) for true decorative img.

2. **Footer "Threads" is a `<button>` opening a link** `src/components/Footer.tsx:80-95`
   — convert to `<a href target="_blank" rel="noopener noreferrer">` for semantics/SEO/keyboard.

3. **Content hidden behind fixed MobileBottomNav** — `safe-area-pb` only adds 8px.
   - Verify pages using bottom nav (e.g. `src/pages/Dashboard.tsx:1159` `pb-24`) clear
     the ~64px nav + safe area. Bump insufficient ones to `pb-28`/`pb-[120px]` on mobile.
   - Confirm `MobileBottomNav` height; adjust page padding, not the nav.

4. **Auth inputs: no visible focus ring** `src/pages/Auth.tsx` inputs —
   add `focus-visible:ring-2 focus-visible:ring-primary` (only if shadcn Input doesn't
   already provide it — verify first; shadcn Input usually does, so this may be a no-op).

5. **Auth form: no visual error state on invalid fields** `src/pages/Auth.tsx` —
   add `aria-invalid` + conditional `border-destructive` when a field has an error.

6. **Auth submit button: missing disabled/aria-busy** `src/pages/Auth.tsx` submit —
   add `disabled={isLoading}` + `aria-busy={isLoading}`.

7. **Auth login/signup tabs missing ARIA roles** `src/pages/Auth.tsx` tab buttons —
   add `role="tablist"`/`role="tab"`/`aria-selected`. (If they're actual shadcn Tabs,
   verify before adding — may already be handled.)

> For 4 & 7, I'll read `Auth.tsx` and the shadcn `input`/`tabs` components first and
> skip any item already handled, to avoid redundant changes.

---

## Verification
- `npx tsc -p tsconfig.app.json --noEmit` (typecheck) and `npx eslint .` on changed files.
- Email code changes are deploy-time verified by user; migration SQL reviewed for syntax.
- Manual review of Auth page render notes (can't run browser here).

## Files touched (expected)
- NEW: `supabase/migrations/<ts>_schedule_process_email_queue.sql`
- `supabase/functions/_shared/smtp.ts`, `api/_shared/smtp.ts`
- `supabase/functions/subscription-reminder/index.ts`
- `supabase/functions/enforce-subscription-limits/index.ts`
- `api/auth-email-hook.ts`
- `supabase/crons/concierge_generate_2h.sql`
- `src/pages/Index.tsx`, `src/components/Footer.tsx`, `src/pages/Auth.tsx`,
  `src/pages/Dashboard.tsx` (+ any other bottom-nav pages needing padding)
