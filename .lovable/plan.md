## Goal

1. Confirm the production email service (Resend + SMTP fallback through `mail.spacemail.com`) is actually delivering mail right now.
2. Grant admin access to `reginaomasoro56@gmail.com` and set the password to `reginaomasoro56`.

## Findings from initial check

- The user `reginaomasoro56@gmail.com` already exists in auth (`id: 329df607-...`).
- A row already exists in `public.user_roles` with `role = 'admin'` for that user — so admin access is **already provisioned**. No additional role insert is needed. They will pass the `AdminLayout` gate as soon as they sign in.
- Email infra is dual-path: `RESEND_API_KEY` (primary) and `SMTP_HOST/USER/PASS` on Spacemail (fallback). Both secrets are present.

## Plan

### 1. Email service verification (no code changes)

- Invoke the existing `smtp-verify` edge function to send a live test email to `reginaomasoro56@gmail.com` and to the platform owner address. This exercises the real transport used by `_shared/smtp.ts` (Resend first, SMTP fallback second).
- Pull `smtp-verify` and `process-email-queue` edge function logs to confirm 200 responses and no DLQ entries in the last hour.
- Run a quick read on `email_send_log` to confirm recent `sent` rows and that nothing is stuck in `pending`/`failed`.
- If any path fails, report the exact failure (auth, DNS, rate limit) and stop for your decision before mutating secrets.

### 2. Admin + password for reginaomasoro56@gmail.com

- Admin role: **already in place** — verified via `user_roles`. No migration needed.
- Password set to `reginaomasoro56`: this requires the Supabase Admin API (cannot be done via plain SQL without touching the protected `auth` schema). Two safe options:
  - **A. One-shot admin script (recommended).** Run a short server-side call using `SUPABASE_SERVICE_ROLE_KEY` → `auth.admin.updateUserById(id, { password, email_confirm: true })`. No new code committed; executed once from the sandbox. Cleanest and immediate.
  - **B. Password reset email.** Trigger a recovery email to the address; user clicks the link and sets the password themselves. Safer (no shared plaintext password in chat history) but requires the user to act.

  Default to **A** since you explicitly provided the password. Confirm if you'd prefer B.

### 3. Reporting

After execution I'll report:
- Email test message IDs + delivery status
- Confirmation the admin login works (role row + password updated)
- Any email infra warnings worth fixing next

## Technical notes

- No schema migration required.
- No edits to `auth-email-hook`, `_shared/smtp.ts`, or templates planned — only verification.
- Password update uses service-role key already stored in secrets; the plaintext password is not logged.

## Question before I execute

Do you want **A (set password to `reginaomasoro56` directly)** or **B (send a password reset email instead)**?
