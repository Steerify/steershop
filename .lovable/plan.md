

# Plan: Shops Security Fix + SEO Indexing + Comprehensive Tests

## Part 1: Restrict Bank Details on Shops Table

### Problem
The `shops` table exposes `bank_name`, `bank_account_name`, `bank_account_number`, `paystack_subaccount_code`, `settlement_bank_code`, `settlement_account_number` to anyone who can SELECT shops. The "Anyone can view active shops" RLS policy returns ALL columns.

### Fix: Create a public-safe database view
Create a `public_shops` view that excludes sensitive columns, then update the client-side code to stop mapping bank fields in public queries.

**Migration SQL:**
```sql
CREATE VIEW public.public_shops AS
SELECT id, owner_id, shop_name, shop_slug, description, logo_url, banner_url,
       is_active, average_rating, total_reviews, whatsapp_number, is_verified,
       primary_color, secondary_color, accent_color, theme_mode, font_style,
       country, state, created_at, updated_at, payment_method
FROM public.shops
WHERE is_active = true;
```

**Code changes:**
- `src/services/shop.service.ts` — In `getShops()` and `getShopBySlug()`, stop returning `bank_name`, `bank_account_name`, `bank_account_number`, `paystack_public_key` in the mapped response. Only include them in `getShopByOwner()` (owner's own shop).

## Part 2: Fix Mutable Search Path Functions

4 email queue functions (`delete_email`, `enqueue_email`, `move_to_dlq`, `read_email_batch`) lack `SET search_path`.

**Migration:** `ALTER FUNCTION` each to add `SET search_path = 'public'`.

## Part 3: Enable Leaked Password Protection

Use `configure_auth` tool with `password_hibp_enabled: true`.

## Part 4: SEO Indexing for Search Engines & AI

The current setup is strong (JSON-LD schemas, meta tags, sitemap, robots.txt, crawler rewrites). Missing pieces:

1. **Add `steersolo.com` canonical domain** — Current `robots.txt` points to `steersolo.com/sitemap.xml` but the preview URL is `steersolo.lovable.app`. Need to ensure published domain matches.

2. **Add AI crawler instructions** — Create `public/ai.txt` (emerging standard for AI crawlers) and update `robots.txt` to explicitly welcome AI bots (GPTBot, ClaudeBot, PerplexityBot, etc.).

3. **Add `llms.txt`** — Machine-readable description of SteerSolo for AI crawlers at `public/llms.txt`.

4. **IndexNow ping** — Add an edge function `index-now` that pings IndexNow (Bing/Yandex) whenever a new shop or product is created, for near-instant indexing.

**Files:**
- `public/ai.txt` — New
- `public/llms.txt` — New  
- `public/robots.txt` — Update with AI crawler rules
- `supabase/functions/index-now/index.ts` — New edge function

## Part 5: Comprehensive Tests

Create tests covering all critical operations to ensure nothing breaks before marketing launch.

### Edge Function Tests (Deno):
- `supabase/functions/auth-email-hook/index_test.ts` — Test email hook responds correctly
- `supabase/functions/paystack-initialize-order/index_test.ts` — Test order payment initialization
- `supabase/functions/shop-og-meta/index_test.ts` — Test OG meta generation for shops
- `supabase/functions/generate-sitemap/index_test.ts` — Test sitemap generation

### Frontend Tests (Vitest):
- `src/services/__tests__/shop.service.test.ts` — Shop CRUD operations
- `src/services/__tests__/product.service.test.ts` — Product CRUD operations  
- `src/services/__tests__/order.service.test.ts` — Order creation and management
- `src/hooks/__tests__/useFeaturePhases.test.ts` — Feature phase gating
- `src/utils/__tests__/subscription.test.ts` — Subscription status calculation
- `src/utils/__tests__/autoCategorize.test.ts` — Product auto-categorization
- `src/components/__tests__/ExploreFilters.test.tsx` — Filter component rendering
- `src/pages/__tests__/Auth.test.tsx` — Auth page renders login/signup

### Test Setup:
- Add `vitest.config.ts` and `src/test/setup.ts` if not present
- Add test dependencies to `package.json`

---

## Files Summary

**New:**
- `public/ai.txt`, `public/llms.txt`
- `supabase/functions/index-now/index.ts`
- 4 edge function test files
- 8 frontend test files
- `vitest.config.ts`, `src/test/setup.ts`

**Edited:**
- `src/services/shop.service.ts` — Strip bank details from public queries
- `public/robots.txt` — AI crawler rules

**Database:**
- Migration: Create `public_shops` view, fix 4 function search paths
- Auth config: Enable HIBP password check

