
# Combined Sprint B + C + TS Build Fix

Three independent tracks. None touch the homepage UI, so the visual refactor is unaffected.

---

## Track 1 — TypeScript Build Errors (unblock compile)

Concrete errors only. No behavior changes beyond making types correct.

1. **`src/components/CheckoutDialog.tsx:466`** — `validateCoupon` returns a discriminated union. Narrow with `'coupon' in result` before reading `result.coupon`.
2. **`src/pages/Products.tsx:404-406`** — Undefined `response` variable. Rename to the actual fetch/invoke result variable in scope (likely `data` or rename the awaited call to `response`).
3. **`src/pages/admin/AdminUsers.tsx:331-354`** — Missing imports. Add `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"`.
4. **`src/services/admin.service.ts:76`** — `get_website_visit_analytics` RPC isn't in generated types. Either (a) cast via `supabase.rpc as any` for that single call, or (b) replace with a direct query against the analytics table. Use (a) as the minimal fix.
5. **`src/services/admin.service.ts:104-110`** — `get_admin_stats` returns `Json`. Cast result: `const stats = data as { total_users: number; total_shops: number; ... }`.
6. **`src/services/coupon.service.ts:103`** — DB row's `discount_type: string` doesn't match `"fixed" | "percentage"`. Cast at the boundary: `discount_type: row.discount_type as 'fixed' | 'percentage'`.
7. **`src/services/referral.service.ts`** — Two issues:
   - `commission_status` / `commission_amount` columns don't exist on `referrals`. Either remove those reads, or add a migration to introduce the columns. Plan: **add migration** `ALTER TABLE referrals ADD COLUMN commission_status text DEFAULT 'pending', ADD COLUMN commission_amount numeric DEFAULT 0;` since admin payout UI depends on it.
   - `ambassador_profiles` table not in generated types → it doesn't exist. Add a migration creating `ambassador_profiles` with RLS, OR (simpler if unused) remove the ambassador queries. Decision: **create the table** (referenced from Ambassador page).

---

## Track 2 — Sprint B: Email Queue Migration

All transactional email sends route through the existing `enqueue_email` RPC + `process-email-queue` dispatcher. This gives retries, rate-limit handling, and DLQ.

Functions to refactor:
- `send-notification-email` → enqueue to `transactional_emails` queue instead of direct Resend call.
- `send-welcome-email` → same; also stop using anon-key client to fetch profile (use service-role).
- `order-notifications` → enqueue order confirmation + shop alert emails to queue.
- `send-password-reset` → audit; route through queue if currently direct.

Each function will:
1. Validate input with Zod.
2. Render the HTML (existing templates kept inline for now).
3. Call `supabase.rpc('enqueue_email', { queue_name: 'transactional_emails', payload: { to, subject, html, from } })`.
4. Return 202 with the message id.

No new email infra is created — the project already has `enqueue_email`, `process-email-queue`, `email_send_log`, queues. We only redirect direct sends into the queue.

---

## Track 3 — Sprint C: Backend / Security Hardening

Addresses every `error`-level finding plus the high-value `warn`s.

### Edge function auth (require JWT in code; keep `verify_jwt = false` in config since we validate manually with service role)

- **`send-phone-otp`** — Require `Authorization` Bearer; derive `userId` from `getUser(token)`; ignore body `userId`. Remove `fallbackCode` from response (server-log only in dev).
- **`verify-phone-otp`** — Same: derive `userId` from JWT, not body.
- **`generate-ad-copy`** — Require JWT; add Zod input validation with length caps (shopName ≤200, descriptions ≤500).
- **`logistics-book-delivery`** — Require JWT; verify `shop.owner_id === user.id` before booking.
- **`know-this-shop`** — Require JWT before AI call (shop data read can stay public if needed; AI gated).
- **`enforce-subscription-limits`** — Require `x-cron-secret` header matching new `CRON_SECRET` env var; reject otherwise.
- **`paystack-setup-service`** — Replace client-supplied `amount` with server-side `PACKAGE_AMOUNTS` map. Add Zod validation.
- **`paystack-webhook`** — Add `type` discriminator: setup-service payments (metadata.type === 'setup_service') must NOT trigger subscription renewal. Also add idempotency check using `paystack_webhook_events` table (insert reference; reject duplicates).
- **`done-for-you-setup`** — Remove `free_setup` from request body. Read `profiles.free_setup_eligible` server-side (new column, default false; admin-set only).

### Migrations

```sql
-- Free setup eligibility (admin controlled)
ALTER TABLE profiles ADD COLUMN free_setup_eligible boolean NOT NULL DEFAULT false;

-- Webhook idempotency
CREATE TABLE paystack_webhook_events (
  reference text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE paystack_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies = service role only.

-- Referral commission columns (Track 1 dependency)
ALTER TABLE referrals
  ADD COLUMN commission_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN commission_amount numeric NOT NULL DEFAULT 0;

-- Ambassador profiles (Track 1 dependency)
CREATE TABLE ambassador_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  legal_name text NOT NULL,
  phone text NOT NULL,
  payout_bank_name text,
  payout_bank_code text,
  payout_account_number text,
  payout_account_name text,
  tier text NOT NULL DEFAULT 'starter',
  total_referrals integer NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ambassador_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile_select" ON ambassador_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_profile_upsert" ON ambassador_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_profile_update" ON ambassador_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "admin_all" ON ambassador_profiles FOR ALL USING (has_role(auth.uid(), 'admin'));
```

### RLS / data-exposure fixes

- **`shops` bank fields exposed publicly** — Create a `shops_public` view (already partially referenced in code) that excludes `bank_account_number`, `bank_account_name`, `bank_name`, `settlement_account_number`, `settlement_bank_code`. Restrict the existing public SELECT policy on `shops` to exclude unauthenticated reads of full row; rewrite frontend public reads to use `shops_public`.
- **`bookings` realtime PII leak** — Add RLS policy on `realtime.messages` scoping booking events to shop owner or booking customer only. (Use `realtime.topic()` extraction pattern.)
- **`referral_codes.user_id` enumeration** — Replace public policy with a `validate_referral_code(code text)` SECURITY DEFINER function that returns only `{ valid: boolean }`; revoke direct SELECT from anon.
- **Public bucket listing** — Restrict `storage.objects` SELECT policy on `shop-images`, `product-images`, `email-assets`, `product-videos` to specific path patterns (no broad listing).
- **SECURITY DEFINER function execute grants** — Run `REVOKE EXECUTE ... FROM anon, authenticated` on internal helpers (`block_deleted_email`, triggers, etc.) keeping only `has_role`, `check_product_limit`, `check_feature_usage`, `claim_prize`, `enqueue_email` callable as needed.

### Verification

- Run `supabase--linter` after migrations.
- Run `security--run_security_scan` and confirm error-level findings cleared.
- Smoke-test: signup OTP flow, checkout, admin dashboard stats.

---

## Order of operations

1. Migrations first (unblocks Track 1 + Track 3).
2. Track 1 TS fixes.
3. Track 2 email function refactors + redeploy.
4. Track 3 edge function auth + redeploy.
5. Storage / RLS / realtime policies.
6. Lint + security rescan.

No homepage / Index.tsx work in this plan — the design refactor stays paused until you're ready to resume Sprint A.
