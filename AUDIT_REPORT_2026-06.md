# SteerSolo Audit Report — 2026-06-01

## Executive Summary

- **27 total findings** (3 P0, 14 P1, 10 P2)
- **Top 3 risks:**
  1. `subscription_plans` table is missing `paystack_plan_monthly` / `paystack_plan_yearly` columns that the subscription service TypeScript interface declares — recurring Paystack subscriptions silently fail to resolve the correct plan code.
  2. Stock decrement on order placement is non-atomic (client-side, after the order row is inserted) — concurrent purchases on limited-stock items will oversell with no guard.
  3. `Shops.tsx` fetches **all** profiles with a subscription plan in a single unbounded query (no pagination, no limit) — at any realistic user scale this will OOM the client tab and slow page load to a crawl.

---

## Vendor Flows

### Dashboard — `src/pages/Dashboard.tsx`
- [P1] `profiles` data fetched twice on load — `src/pages/Dashboard.tsx:282` and `:325` both do `.from('profiles').select('*').eq('id', user.id).single()` in the same mount effect with no shared cache → duplicate round-trips on every load. Fix: consolidate into one call.
- [P1] Payment-verification error swallowed silently — `:300` `catch (error) { console.error(...) }` with no toast, leaving the user on a blank subscription state after a Paystack redirect. Fix: surface a toast + retry button.
- [P2] `console.error` at `:478` leaks internal stack traces in production.

### Products — `src/pages/Products.tsx` / `src/services/product.service.ts`
- [P1] AI description edge function result not validated — `src/pages/Products.tsx:232` calls `functions.invoke("ai-product-description")` and writes the result directly without checking `error` or whether `data` is null. If the edge function cold-starts or quota is exhausted the field silently stays empty. Fix: check error, show toast.
- [P2] `product.service.ts` fires a fire-and-forget `shops` query (`.then(...)` with no `.catch`) after creating a product to read `shop_slug` for cache invalidation — any error is fully swallowed.

### Orders — `src/pages/Orders.tsx`
- [P1] Status-update notification at `src/pages/Orders.tsx:252` is fire-and-forget with no error handling — if the edge function is down, the vendor gets no feedback. Fix: await and show a non-blocking warning toast.
- [P2] `order.service.ts:updateOrderStatus` writes `processing_at`, `out_for_delivery_at`, `delivered_at`, `confirmed_at` — all exist in schema ✓ — but there is no guard preventing a status regression (e.g. moving "completed" back to "pending") from the UI.

### Bookings — `src/pages/Bookings.tsx`
- [P1] Shops query at `:65` selects `'*'` with no column restriction — fetches bank credentials and other sensitive shop fields to the client unnecessarily. Fix: select only needed columns.
- [P2] No loading skeleton while the secondary bookings query (`:96`) resolves — UI flickers from empty to populated.

### Customers — `src/pages/Customers.tsx`
- [P1] Orders fetched with no `LIMIT` — `:65` does `.from("orders").select(...).eq("shop_id", shop.id)` with no pagination. A shop with 10,000+ orders will download the entire history on every page load. Fix: add `.limit(500)` or paginate.

### MyStore — `src/pages/MyStore.tsx`
- [P1] SEO DNA edge function result at `:387` is not error-guarded — if `generate-shop-seo-dna` fails the shop's `seo_description` silently goes un-updated with no user feedback.
- [P2] `StorefrontCustomizer.tsx:232` updates `shops` with `theme_mode`, `primary_color`, etc. but does not re-fetch shop data after save, so the preview may show stale values until hard refresh.

### Subscription — `src/pages/Subscription.tsx`
- [P0] **`paystack_plan_monthly` / `paystack_plan_yearly` missing from DB schema** — `src/services/subscription.service.ts:16-17` declares these as optional fields on `SubscriptionPlan`. The `subscription_plans` table type in `types.ts` has **no such columns**. If the `paystack-initialize` edge function reads `paystack_plan_monthly` from the DB row to pass to Paystack's recurring API, it will always receive `null`, meaning every subscription initializes as a one-time charge instead of a recurring plan. Fix: `ALTER TABLE subscription_plans ADD COLUMN paystack_plan_monthly text, ADD COLUMN paystack_plan_yearly text;` then regenerate types.
- [P1] `subscription_history` query at `:89` has no `.eq('user_id', ...)` filter beyond what RLS enforces — if RLS is misconfigured this returns all users' history. Fix: add explicit `.eq('user_id', profile.id)` as defense-in-depth.
- [P2] History list shows raw ISO timestamps with no formatting.

### Settings — `src/pages/Settings.tsx`
- [P1] `:46` selects `'*'` from `shops` (includes `paystack_subaccount_code`, `settlement_bank_code`, `settlement_account_number`) — sensitive bank routing data exposed to the client unnecessarily. Fix: select only display fields.

### IdentityVerification — `src/pages/IdentityVerification.tsx` / `src/components/kyc/KYCLevel{1,2}Form.tsx`
- [P1] KYCLevel1Form and KYCLevel2Form both update `profiles` directly from the client — `src/components/kyc/KYCLevel1Form.tsx:34` and `KYCLevel2Form.tsx:52`. BVN, phone verification data, and bank account data should flow through an edge function with server-side validation, not a direct `.update()`. Relies 100% on RLS correctness with no secondary check. Fix: route KYC updates through a trusted edge function.

### Payout / PayoutRequestDialog — `src/services/payout.service.ts`
- [P1] `getBalance` calculates available balance purely from `revenue_transactions` and `shop_payouts` on the client with no server-authoritative check — two simultaneous payout requests could both pass the balance check and overdraw. Fix: add a DB-level balance function or use a pessimistic lock via RPC.
- [P2] `getPayoutHistory` orders by `requested_at` but the column in the schema is `requested_at` (default now()) — confirmed correct ✓. No issue.

### BulkProductUpload — `src/components/BulkProductUpload.tsx`
- [P1] `subscription_history` insert at `:219` sets `amount: 500000` — this appears to be in **kobo** (₦5,000) but the `subscription_history.amount` column stores values in **naira** in all other places (e.g. Subscription.tsx renders the amount as naira directly). This will show "₦500,000" in subscription history. Fix: use `5000` for naira-denominated storage.
- [P2] `ai-bulk-product-create` result is not validated for partial failures — `:88` assumes all products were created successfully even if the function returned only a partial list.

---

## Admin Flows

### AdminLayout — `src/components/AdminLayout.tsx`
- [P1] Weak admin auth fallback — `:86` comment says "Role set in profile but missing from user_roles — grant access anyway." This means any user who can write their own `profiles.role` (e.g. via a client-side update if RLS is misconfigured) bypasses the `user_roles` table check entirely. Fix: remove the fallback or make it log a security alert and deny.

### AdminShops — `src/pages/admin/AdminShops.tsx`
- [P1] Admin `send-notification-email` edge function invoked at `:207` with no rate limiting on the client — an admin could spam-email all shop owners by rapidly clicking the button. Fix: debounce button + add server-side rate limit check.
- [P2] Shops list fetches `profiles` in a separate query per batch (`:116`) inside a loop — N+1 pattern. Fix: join via a single query with `.select('*, profiles!shops_owner_id_fkey(*)')`.

### AdminDashboard — `src/pages/admin/AdminDashboard.tsx`
- [P2] `get_admin_stats` RPC and `get_website_visit_analytics` RPC errors are caught and `console.error`'d but stats silently show 0 — no admin-visible error state.

### AdminOrders / AdminPlatformEarnings
- [P1] `admin.service.ts:75` fetches last 10 orders with `select('*, order_items(*, products(*)))'` — this eager-loads full product objects for every order item on every admin dashboard load. Replace with a leaner select.

---

## Customer Flows

### ShopStorefront — `src/pages/ShopStorefront.tsx`
- [P1] `:281` fetches profile subscription data (`.from('profiles').select('subscription_plan_id, is_subscribed, subscription_expires_at')`) with no `.eq('id', ...)` explicit user filter — relies purely on RLS. If the storefront is loaded while unauthenticated and RLS allows public reads of `profiles`, this returns the first profile row. Fix: always supply `.eq('id', shopData.owner_id)`.
- [P2] Products query at `:295` fetches `select("*")` — includes `digital_file_url` (pre-signed or plain path), `nafdac_number`, and `video_url` for every product on the storefront. Should select only display-needed columns.

### CheckoutDialog — `src/components/CheckoutDialog.tsx`
- [P0] **Non-atomic stock decrement** — `:929–934` decrements `stock_quantity` as a client-side best-effort fire-and-forget **after** the order row is already inserted. Two concurrent buyers can both pass the `stock_quantity > 0` UI check, both have their orders inserted, and both trigger stock decrements that race each other. At stock=1 the field goes to 0 but both orders exist. Fix: use a DB-level function (`decrement_stock_if_available`) called in an RPC that returns `false` on stock-out, and roll back the order insert.
- [P0] **Order notification fires before Paystack payment is confirmed** — `:640` sends the `order-notifications` edge function (which emails the shop owner) as soon as the order row is created, before the customer completes Paystack checkout. If the customer abandons the Paystack modal, the shop owner received a false "new order" notification. Fix: send the notification only inside the Paystack `callback` handler (`:callback` in `initializePaystackPayment`), or trigger it from the Paystack webhook edge function.
- [P1] `shops` query at `:622` selects `uses_own_logistics, own_logistics_note` — column exists ✓ — but also selects `owner_id` which is used to fetch `profiles.email` at `:629`. The customer's browser thus receives the shop owner's private email address in the API response. This leaks PII to the customer client. Fix: move the owner-email lookup to the edge function.
- [P1] Delivery rate selection: if `deliveryService.getRates()` fails, the error is caught and logged but the UI falls back to "no delivery rates available" with no clear message to the user.

### CustomerOrders — `src/pages/customer/CustomerOrders.tsx`
- [P1] Uses `orderService.getOrdersByCustomer(user.id)` which does `.eq('customer_id', customerId)` — guest orders (placed without login) use `customer_id: null` and are therefore invisible to returning customers who later sign in. No reconciliation flow exists. Fix: also match on `customer_email`.

### CustomerRewards — `src/pages/customer/CustomerRewards.tsx`
- [P2] `reward.service.ts:49` calls `rpc('claim_prize')` — the RPC exists in types ✓ — but the UI doesn't disable the claim button while the RPC is in flight, allowing double-submissions.

### ProductDetails — `src/pages/ProductDetails.tsx`
- [P2] Product detail page does `select("*")` on products — same PII concern as storefront.

---

## Schema Gaps

### Missing columns / tables

- [P0] `subscription_plans` is missing `paystack_plan_monthly text` and `paystack_plan_yearly text` columns.
  ```sql
  ALTER TABLE subscription_plans
    ADD COLUMN IF NOT EXISTS paystack_plan_monthly text,
    ADD COLUMN IF NOT EXISTS paystack_plan_yearly text;
  ```
  Then re-run `supabase gen types typescript` to update `types.ts`.

- [P1] `shops` table has no `city` column in the types — wait, **confirmed present** at line 2594. ✓ No action needed.

- [P1] `orders` table has no `updated_at` auto-update trigger confirmed in types — column exists but there is no `BEFORE UPDATE` trigger shown. `order.service.ts` manually sets `updated_at: new Date().toISOString()` — this is fragile since any direct DB update bypasses it. Recommend a `moddatetime` trigger.

### RLS / GRANT gaps

- [P1] `profiles` table — `ShopStorefront.tsx:281` relies on RLS to scope the `profiles` read to the correct owner but does not pass an explicit `.eq('id', ownerId)`. If RLS is set to "authenticated users can read any profile" (common during development) this query returns arbitrary rows.
- [P1] `revenue_transactions` / `shop_payouts` — `payout.service.ts` fetches these by `shop_id` param from the client. Confirm that RLS policies on both tables restrict reads to `auth.uid() = shops.owner_id` via a join-based policy; the code itself provides no additional guard.
- [P1] `shop_payouts` INSERT — `payout.service.ts:requestPayout` does a direct client insert of a payout request. There is no server-side idempotency check (duplicate payout requests for the same amount in rapid succession would both succeed). Recommend an RPC with an idempotency key check.
- [P1] `admin_security_alerts` / `admin_mutation_rate_limits` — these tables exist but are never read in the frontend admin pages. Confirm that the edge functions actually write to them; if not, admin actions (e.g. shop deletions) are unlogged.

### Unused tables (candidates for removal or wiring up)

- [P2] `product_recommendations` — table exists in schema but no code reads or writes to it (zero `.from('product_recommendations')` references found). Either wire it into the discovery/storefront flow or drop it.
- [P2] `customer_preferences` — table exists, no code references it. Either implement a preferences UI or drop.
- [P2] `safebeauty_tiers` — table exists; `SafeBeautyBadge.tsx` renders a badge but no code queries `safebeauty_tiers`. The badge is hardcoded, making it misleading.
- [P2] `promoted_listings` — table exists with no frontend read path. `AdsLanding.tsx` inserts to `marketing_services` instead. Promoted listings appear to be an orphaned feature.
- [P2] `email_send_state` / `email_send_log` / `suppressed_emails` — managed entirely in edge functions; no admin UI to view them, making email deliverability debugging invisible to admins.

---

## Fix Plan Checklist

Every P0 and P1 ordered by risk:

1. **[P0-A]** Add `paystack_plan_monthly` and `paystack_plan_yearly` to `subscription_plans` table; regenerate types. Verify `paystack-initialize` edge function uses them for recurring plans.
2. **[P0-B]** Replace client-side stock decrement in `CheckoutDialog.tsx:929` with an atomic DB RPC (`decrement_stock_if_available`) that returns a boolean; roll back order insert on failure.
3. **[P0-C]** Move `order-notifications` edge function call inside the Paystack `callback` handler (or Paystack webhook) so notifications only fire for confirmed payments.
4. **[P1-1]** `KYCLevel1Form` / `KYCLevel2Form`: route all KYC updates through a server-side edge function instead of direct `.update()` on `profiles`.
5. **[P1-2]** `AdminLayout.tsx:86`: remove the fallback that grants admin access when `user_roles` row is missing; require both `profiles.role = 'admin'` AND a `user_roles` row.
6. **[P1-3]** `CheckoutDialog.tsx:629`: move shop-owner email lookup out of the customer browser context into the edge function to prevent PII leakage.
7. **[P1-4]** `Shops.tsx:166`: add `.limit(1000)` (or paginate) to the unbounded `profiles` fetch to prevent memory issues.
8. **[P1-5]** `Customers.tsx:65`: add `.limit(500)` or server-side pagination to the shop orders fetch.
9. **[P1-6]** `payout.service.ts:requestPayout`: add an idempotency check (RPC or unique constraint on `shop_id + amount + created_at` within a 60-second window) to prevent duplicate payout submissions.
10. **[P1-7]** `payout.service.ts:getBalance`: move balance calculation to an RPC or enforce RLS so `shop_id` param cannot be spoofed by the client.
11. **[P1-8]** `Subscription.tsx:89`: add explicit `.eq('user_id', profile.id)` to the `subscription_history` query as defense-in-depth even with RLS.
12. **[P1-9]** `BulkProductUpload.tsx:219`: change `amount: 500000` to `amount: 5000` (naira-denominated, consistent with the rest of `subscription_history`).
13. **[P1-10]** `Settings.tsx:46` and `Bookings.tsx:65`: replace `select('*')` with explicit column lists excluding bank credentials and sensitive fields.
14. **[P1-11]** `ShopStorefront.tsx:281`: add `.eq('id', shopData.owner_id)` to the profiles query so it never accidentally returns an arbitrary row.
15. **[P1-12]** `Dashboard.tsx:282` + `:325`: consolidate the two separate `profiles` fetches into one to eliminate duplicate network round-trips.
16. **[P1-13]** `Dashboard.tsx:300` and `Products.tsx:232`: add visible toast error handling when edge function calls fail, rather than silent `console.error`.
17. **[P1-14]** `CustomerOrders`: also query orders by `customer_email` so guest orders are visible to returning logged-in customers.
