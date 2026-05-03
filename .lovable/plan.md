# Fix Subscriptions, Blank Screens & Email Flow

## Root causes found

After a deep audit, **three concrete bugs** are silently breaking the app — and one of them is exactly why joyadaeze845@gmail.com's ₦5,000 payment never reflected.

### 1. Subscription verify is broken (this is why Joy's payment didn't reflect)
`supabase/functions/paystack-verify/index.ts` tries to update a column called `payment_reference` on the `profiles` table. **That column does not exist** (confirmed against the live schema). So when Paystack redirects the user back to `/dashboard?subscription=verify&reference=...`, the verify edge function throws an error, the toast shows failure, and `is_subscribed` is **never** set to true. The webhook backup also failed because no `paystack_webhook_events` row was ever inserted for her — meaning Paystack's webhook didn't reach us either (likely webhook URL not configured in Paystack dashboard, or signature mismatch from a previous deploy).

Joy's profile right now:
- `is_subscribed: false`
- `subscription_plan_id: null`
- `subscription_expires_at: 2026-01-15` (still the trial date)
- Role is correct: `shop_owner`

### 2. `website_visits` table is missing
`track-visit` edge function logs are spamming `PGRST205: Could not find the table 'public.website_visits'`. Every page load fails this call → contributes to slow loads and console noise.

### 3. `orders.payment_instrument_fingerprint` column is missing
The Paystack webhook tries to write this on real order payments. When an order is paid, the webhook update silently fails → orders stay marked `pending`.

---

## What I'll do (in order)

### Step 1 — Reconcile Joy's payment manually & verify with Paystack
- Use the Paystack Transactions API server-side to look up her latest successful transaction by email.
- Set her profile: `is_subscribed=true`, `subscription_plan_id` = Pro plan (₦5,000 monthly = `c4d6853e-...`), `subscription_expires_at = now() + 30 days`, `subscription_type='monthly'`.
- Insert a `revenue_transactions` + `paystack_webhook_events` record so it shows in admin records and prevents double-credit.

### Step 2 — Fix the subscription verify bug (the real root cause)
Database migration:
- Add `payment_reference text` column to `profiles` (used by verify + idempotency check).
- Add `payment_instrument_fingerprint text` column to `orders`.
- Create the missing `website_visits` table with proper schema + RLS (admin read, service-role insert) so analytics + track-visit stop erroring.

### Step 3 — Harden the payment success flow (so this never repeats)
- Implement the **polling pattern** on the Dashboard success handler: after redirect, poll `is_subscribed` for ~20 s before showing failure. This handles the race between Paystack redirect and webhook.
- Make `paystack-verify` idempotent and log structured errors so future failures are visible in Edge Function logs.
- Add a one-shot admin tool path: an admin-only edge function `admin-reconcile-payment` that takes a Paystack reference, verifies it via Paystack API, and applies the subscription — for any future stuck payments.

### Step 4 — Confirm Paystack webhook URL is live
- Document the exact webhook URL the user must paste in Paystack dashboard:
  `https://hwkcqgmtinbgyjjgcgmp.supabase.co/functions/v1/paystack-webhook`
- The webhook code already does HMAC-SHA512 signature check + idempotency via `paystack_webhook_events`, so once the URL is set, future payments will self-heal even if the redirect step fails.

### Step 5 — Email flow audit (user signup → welcome → orders)
- `send-welcome-email`: works but uses direct Resend send, no retry. Migrate to the `transactional_emails` queue (`enqueue_email` RPC) so failed sends retry automatically. Same for `order-notifications`.
- Verify `RESEND_API_KEY` and `notify.steersolo.com` domain are still valid (read-only check via `email_send_log`).
- Confirm Supabase Auth → `auth-email-hook` is wired so signup confirmation emails go through our branded template (already implemented; just verify config).

### Step 6 — Sweep other blank-screen causes
- `Dashboard.tsx` calls `subscriptionService.initializePayment('basic', 'monthly')` — but there is **no plan with slug 'basic'** in the DB. Plans are `free`, `growth`, `pro`. This errors → blank state on the upgrade CTA. Fix to `'growth'` (default paid plan) or read from DB.
- `useShopOwnerAuth` falls back to a synthetic profile silently when `profiles` fetch fails — replace with explicit error UI so users don't see a blank dashboard.
- Add an error boundary around the Dashboard route so any thrown render error shows a recover button instead of a blank page.

### Step 7 — Verification pass
- Run the Supabase linter and re-check `paystack-webhook` & `paystack-verify` edge function logs.
- Curl `paystack-verify` with Joy's reference end-to-end to confirm the column fix works.
- Confirm her dashboard now shows the Pro plan as active.

## Technical details

| Area | File / Change |
|---|---|
| Migration | `ALTER TABLE profiles ADD COLUMN payment_reference text;` |
| Migration | `ALTER TABLE orders ADD COLUMN payment_instrument_fingerprint text;` |
| Migration | `CREATE TABLE website_visits (...)` + RLS |
| Edge fn fix | `paystack-verify/index.ts` — already references the column, just needs the column to exist |
| Edge fn new | `admin-reconcile-payment/index.ts` (admin-gated, calls Paystack verify API) |
| Edge fn refactor | `send-welcome-email`, `order-notifications` → use queue |
| Frontend | `Dashboard.tsx` — fix `'basic'` slug, add 20 s subscription polling on `?subscription=verify`, add error boundary |
| Data fix | One-time SQL to activate Joy's Pro plan after Paystack confirmation |

## Out of scope for this pass
- Visual/UX redesign (was handled in earlier turns; colors are now Deep Navy + Nigerian Green per memory).
- Removing the GSI FedCM console warning (Google's One-Tap policy on the iframe; harmless).
