# Email + Concierge Reliability Fixes

## 1. Email — make Resend actually deliver

**Current state (verified):**
- `RESEND_API_KEY` is set as a Supabase secret ✅
- `_shared/smtp.ts` correctly prefers the Resend HTTP API when the key exists ✅
- `auth-email-hook` is wired to use it ✅
- Default from address: `SteerSolo <no-reply@steersolo.com>`

**Likely cause of "no mail arriving":** either the Resend account does not have `steersolo.com` verified as a sending domain (Resend silently rejects/quarantines), or the auth hook is not registered with Supabase Auth so signup emails never call our function. Past migration was attempted but needs reconfirmation.

**Actions:**
1. Redeploy `auth-email-hook` and `send-password-reset` to ensure latest Resend-first transport is live.
2. Add a small diagnostic Edge Function `email-diagnostic` that:
   - Calls Resend `/emails` directly with the configured `RESEND_API_KEY`.
   - Returns the full Resend response (id or error JSON) so we can see whether the domain is verified, whether the key is scoped, etc.
   - Sends a real branded test message to `okechukwuchukwufulumnanya10@gmail.com`.
3. Trigger Supabase Auth's password-recovery flow for `okechukwuchukwufulumnanya10@gmail.com` (creates the user first if missing, then `resetPasswordForEmail`) — this proves the full Auth → Hook → Resend → inbox path end-to-end.
4. Log results in `email_send_log` (insert from diagnostic) and report back exactly what Resend said.
5. If Resend reports `domain not verified`, fall back temporarily to `onboarding@resend.dev` as the sender so the test message still arrives, and tell the user which DNS records to add at `steersolo.com` to fix it permanently.

## 2. WhatsApp Concierge — hourly + 3/day for Foundry & Vendor

**Current state (verified):**
- Cron `concierge-generate-every-2h` runs `0 */2 * * *` (every 2 hours).
- `pickSlotForGroup` already defines exactly 3 daily slots for Foundry (07:00, 13:00, 19:00) and 3 for Vendor (07:00, 13:00, 19:00).
- Because cron only fires on even hours, 13:00 and 19:00 are never hit → Foundry/Vendor effectively get 1 post/day, marketplace runs as designed.

**Actions:**
1. Replace the 2-hour cron with an **hourly** cron `0 * * * *` named `concierge-generate-hourly` (drop the old one).
2. Keep `pickSlotForGroup` as-is for marketplace (still 7 even-hour slots) so we don't double-post.
3. Verify Foundry now produces `tech_insight` (07), `community_poll` (13), `founder_story` (19) = 3/day.
4. Verify Vendor produces `sales_tip` (07), `platform_feature` (13), `merchant_win` (19) = 3/day.
5. Add a follow-up read of `marketing_queue` to confirm rows for all three groups exist for today.

## Technical details
- Migration: `DROP` old cron job, `cron.schedule('concierge-generate-hourly', '0 * * * *', ...)`.
- New function: `supabase/functions/email-diagnostic/index.ts` with CORS, validates `RESEND_API_KEY`, posts to `https://api.resend.com/emails`, returns JSON.
- Config: register `email-diagnostic` in `supabase/config.toml` with `verify_jwt = false`.
- No frontend changes required.
