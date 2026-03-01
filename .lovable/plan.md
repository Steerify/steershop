

# Plan: Security Hardening, Discount Prices, Email Fixes, AI Bulk Upload, Store Verification Popup, and More

This is a large multi-part request. Here's the plan broken into prioritized batches.

---

## Batch 1 — High Priority (Security, Email Fixes, Domain Cleanup)

### 1A. Security Hardening

Audit and fix across the codebase:

- **RLS audit:** Run the database linter. Verify all tables with user data have proper RLS. Check for overly permissive policies (e.g. `true` on INSERT).
- **Input sanitization:** Audit all `dangerouslySetInnerHTML` usage (if any). Ensure DOMPurify is used where needed. Add zod validation to any forms missing it.
- **Edge function auth:** Verify all edge functions check `Authorization` header and validate the user via `supabase.auth.getUser()` before processing.
- **Rate limiting:** Ensure auth rate limits are enforced on login/signup.
- **XSS prevention:** Audit WhatsApp message construction (URL encoding), storefront rendering of user-generated content.

**Files:** Multiple edge functions, `CheckoutDialog.tsx`, `ShopStorefront.tsx`, etc.

### 1B. Fix Email Templates

- **Logo deformation:** Change `<Img>` from `width="120" height="40"` to `width="120" height="auto"` (or actual aspect ratio) across all 6 templates.
- **Link fix:** Change `siteUrl` default from `steersolo.lovable.app` to `https://steersolo.com` in `auth-email-hook/index.ts` (`SAMPLE_PROJECT_URL`).
- **Body text update:** Change "You're one step away from launching your online store" to "You're one step away from launching your WhatsApp-powered online store."

**Files:** `supabase/functions/auth-email-hook/index.ts`, `supabase/functions/_shared/email-templates/signup.tsx`

### 1C. Replace Remaining `steersolo.lovable.app` References

Still 75 occurrences in 7 files (edge functions + `index.html`). Replace all with `steersolo.com`.

**Files:** `index.html`, `supabase/functions/generate-sitemap/index.ts`, `supabase/functions/shop-og-meta/index.ts`, `supabase/functions/engagement-reminders/index.ts`, `supabase/functions/subscription-reminder/index.ts`, `supabase/functions/auth-email-hook/index.ts`

---

## Batch 2 — Product Discount Feature

### 2A. Database: Add `compare_price` Column

Add a nullable `compare_price` (numeric) column to the `products` table. This is the original/crossed-out price. The existing `price` field becomes the discounted/selling price.

### 2B. Products Page: Discount Fields

Add "Original Price" and "Selling Price" fields side by side in the product create/edit form. When original > selling, show the discount percentage.

### 2C. Storefront Display

On `ShopStorefront.tsx` and `ProductDetails.tsx`, show the `compare_price` with a strikethrough next to the actual `price`. Example: ~~₦5,000~~ ₦3,500.

**Files:** DB migration, `Products.tsx`, `ShopStorefront.tsx`, `ProductDetails.tsx`, `product.service.ts`, `types/api.ts`

---

## Batch 3 — Store Creation Verification Popup + Welcome Email

### 3A. Post-Store-Creation Popup

After the DoneForYouPopup completes or after a shop is created via `MyStore.tsx`, show a dialog: "Your shop is being reviewed and will be live within 30 minutes to 7 hours. We'll notify you when it's ready!"

**Files:** `DoneForYouPopup.tsx` (add a "verification" step), `MyStore.tsx`

### 3B. Welcome Email After Signup (Shop Owner Intro)

Create a new edge function `send-welcome-email` that fires after a shop owner creates their first store. Email includes: dashboard overview, how to add products, how to share their store link, payment setup reminder, and support contact.

**Files:** New `supabase/functions/send-welcome-email/index.ts`, trigger from `DoneForYouPopup.tsx` or `MyStore.tsx` after shop creation

---

## Batch 4 — Admin GBP Submissions View

The `AdminMarketingConsultations.tsx` page currently only fetches from `marketing_services` table. It doesn't query `google_business_profiles` at all.

Add a new tab "Google Business Profiles" to the admin page that lists all submitted GBP requests with status management (draft/submitted/in_progress/completed).

**Files:** `src/pages/admin/AdminMarketingConsultations.tsx`

---

## Batch 5 — AI Bulk Product Upload (10 Photos → Auto-Generated Cards)

### 5A. New Component: `BulkProductUpload.tsx`

A dialog/page where the shop owner uploads up to 10 images (or videos). For each, the AI:
1. Analyzes the image to identify the product
2. Generates: name, description, category, suggested price range
3. Creates a draft product card the owner can review and confirm

Uses the Lovable AI gateway (google/gemini-2.5-flash with vision) — no extra API key needed.

### 5B. New Edge Function: `ai-bulk-product-create`

Accepts an array of image URLs. For each image, calls the AI to generate product info. Returns an array of draft product objects.

### 5C. Integration

Add a "Bulk Upload with AI" button on the Products page. After AI generates drafts, owner reviews and confirms. Products are then batch-inserted.

**Files:** New `src/components/BulkProductUpload.tsx`, new `supabase/functions/ai-bulk-product-create/index.ts`, `Products.tsx`

---

## Batch 6 — Mobile Responsiveness (Orders Page)

Audit `Orders.tsx` (690 lines). The order cards, tables, and dialogs need responsive treatment:
- Use `flex-col` on mobile for order details
- Make invoice template scrollable on small screens
- Ensure approval dialog doesn't overflow on mobile

**Files:** `src/pages/Orders.tsx`

---

## Batch 7 — SEO for Paid Shops (AI & Search Engine Discovery)

Enhance the `shop-og-meta` edge function to generate richer structured data (JSON-LD `LocalBusiness` schema) for paid shops. This makes paid shops discoverable by Google, Bing, and AI assistants (ChatGPT, Perplexity, etc.).

Also ensure the `generate-sitemap` function includes all active paid shop URLs.

**Files:** `supabase/functions/shop-og-meta/index.ts`, `supabase/functions/generate-sitemap/index.ts`

---

## Batch 8 — Ads Manager Enhancement (Advisory)

Running actual Facebook/Google/TikTok ads through the SteerSolo interface requires official API integrations:
- **Facebook/Instagram Ads:** Requires a Facebook Marketing API app, Business Manager setup, and user OAuth with `ads_management` scope. This is a significant integration (~2-4 weeks of work).
- **Google Ads:** Requires Google Ads API developer token and OAuth flow. Also substantial.
- **TikTok:** Requires TikTok Marketing API access.

**Recommendation:** This is a major feature that goes beyond what can be scaffolded in a single session. The current AI ad copy generator is the right first step. For Phase 2, I recommend starting with the **Facebook Marketing API** integration since it covers both Facebook and Instagram. I'll need your Facebook Business Manager ID and App credentials to proceed. Want to start with Facebook Ads integration specifically?

---

## Subscription Check

The subscription flow (Paystack initialize → verify → update profile) is already wired up. I'll verify the `paystack-initialize` and `paystack-verify` edge functions handle the new Growth/Pro pricing correctly and that the webhook processes recurring payments.

---

## Summary

| # | Feature | Priority | Effort |
|---|---------|----------|--------|
| 1A | Security hardening | Critical | Medium |
| 1B | Email template fixes | Critical | Small |
| 1C | Domain cleanup (edge functions) | Critical | Small |
| 2 | Product discount (compare_price) | High | Medium |
| 3A | Store verification popup | High | Small |
| 3B | Welcome email for shop owners | High | Medium |
| 4 | Admin GBP view | High | Small |
| 5 | AI bulk product upload | High | Large |
| 6 | Mobile responsiveness (Orders) | Medium | Medium |
| 7 | SEO for paid shops | Medium | Small |
| 8 | Full ads manager (Facebook API etc.) | Low | Very Large |

