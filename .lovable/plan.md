

# Plan: Premium Shop SEO Discoverability, Contact Update, Mobile Audit & Functionality Review

## Critical Issues Found

### A. Inconsistent Pricing & Trial Claims Across Codebase

The actual subscription tiers (from memory) are: **Free (₦0), Growth (₦2,500/mo), Pro (₦5,000/mo)**. But across the codebase:

- `SEOSchemas.tsx` says: Basic ₦1,000, Pro ₦3,000, Business ₦5,000
- `FAQ.tsx` says: "starting at ₦1,000/month"
- All 6 SEO landing pages say: "₦1,000/month with 15-day free trial"
- `DemoStoreFront.tsx` says: "15-day free trial"
- `SEOPageTemplate.tsx` says: "15-day free trial"
- `DynamicPricing.tsx` enterprise link uses fake number `2348000000000`
- `Pricing.tsx` FAQ says: "your store remains active but hidden until you subscribe" (inconsistent with free plan)
- `Pricing.tsx` guarantee says "next month is free" (unenforced)

### B. Wrong Contact Number Everywhere

Current: `+2349059947055` appears in Footer, FAQ, SEOSchemas, index.html
Should be: `+234 916 192 2351`

### C. Premium Shop SEO — Not Gated by Plan

Currently `shop-og-meta` serves rich SEO for ALL active shops regardless of plan. The `isSubscribed` check only adds `priceRange` — it doesn't gate the core indexing. The sitemap includes ALL shops. For Instagram-like discoverability (search by name → find the shop), premium shops need enhanced treatment.

---

## Plan

### 1. Enhanced Premium Shop SEO (Pro/Business Plans)

**`shop-og-meta` edge function:**
- Fetch the owner's `subscription_plan_id` and join to `subscription_plans.slug`
- For Pro/Business plan shops: serve full rich HTML with JSON-LD, all product schemas, aggregate ratings, `@id` identifiers, `sameAs` links, and WebPage schema — making them highly crawlable
- For Free/Growth plan shops: serve basic OG meta (title, description, image) but skip the rich product schemas and enhanced structured data. Still indexable, but not "premium findable"
- Add `WebPage` schema with `isPartOf` linking to SteerSolo for premium shops

**`generate-sitemap` edge function:**
- Join shops to profiles to check subscription plan
- Give Pro/Business shops `priority: 0.9` and `changefreq: daily`
- Give Free/Growth shops `priority: 0.6` and `changefreq: weekly`
- Add `<lastmod>` based on actual product updates for premium shops

**`ShopStorefront.tsx` client-side SEO:**
- Already injects JSON-LD — enhance for Pro/Business by adding `sameAs`, `potentialAction` (SearchAction), and individual product `@id` references

### 2. Update Contact Number Everywhere

Replace `+2349059947055` / `2349059947055` with `+2349161922351` in:
- `index.html` (meta tag)
- `src/components/Footer.tsx` (WhatsApp link)
- `src/components/SEOSchemas.tsx` (contactPoint)
- `src/pages/FAQ.tsx` (WhatsApp link)

Replace fake `2348000000000` in `DynamicPricing.tsx` with the real number.

### 3. Fix All Pricing & Trial Inconsistencies

Update hardcoded pricing to match actual tiers (Free/Growth ₦2,500/Pro ₦5,000):
- `SEOSchemas.tsx` — fix Product schema offers and FAQ answers
- `FAQ.tsx` — update pricing answer
- `Pricing.tsx` — fix FAQ about "store hidden" to mention Free plan, remove unenforced guarantee or make it accurate
- 6 SEO pages (`SellOnWhatsApp`, `SellOnInstagram`, `OnlineStoreNigeria`, `SmallBusinessTools`, `SellOnlineNigeria`, `AcceptPayments`) — update pricing and trial mentions
- `SEOPageTemplate.tsx` — update CTA text
- `DemoStoreFront.tsx` — update CTA text
- `tourSteps.ts` — update tour text
- Replace "15-day free trial" everywhere with "Free forever plan (up to 5 products)"

### 4. Mobile Responsiveness Audit

Key pages to check and fix:
- **Dashboard:** Already uses responsive grids. Carousel has swipe. Verified good.
- **Products page:** Uses responsive layout. Good.
- **Orders page:** Needs check — order cards may overflow on small screens
- **Shops browse page:** Grid already responsive. Good.
- **ShopStorefront:** Floating cart bar may overlap bottom nav on mobile — check z-index
- **Pricing page:** Plan profile cards use `grid-cols-4` which may squeeze on mobile — already has `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`. Good.

### 5. Non-Working / Unnecessary Functionalities

**Issues identified:**
- `FinalCTASection.tsx` — imported but NOT used on Index page anymore (dead component)
- `SocialProofStats.tsx` — shows hardcoded fallback "500+" even when real count is 0. Should show "Growing" instead of inflated numbers when data is low
- `FeaturedShopsBanner` — depends on `featured_shops` table entries. If empty, renders nothing (fine, but could show a CTA instead)
- `HomepageReviews` — likely depends on `reviews` or `platform_reviews` table. If empty, may show nothing
- Ambassador page — exists but unclear if the referral system fully works
- `GrowthPage.tsx` — publicly shows internal metrics (total users, GMV). This could be sensitive; consider gating

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/shop-og-meta/index.ts` | Gate rich SEO by Pro/Business plan |
| `supabase/functions/generate-sitemap/index.ts` | Prioritize premium shops |
| `index.html` | Update contact number |
| `src/components/Footer.tsx` | Update WhatsApp number |
| `src/components/SEOSchemas.tsx` | Fix pricing, contact, FAQ text |
| `src/components/DynamicPricing.tsx` | Fix enterprise contact number |
| `src/pages/FAQ.tsx` | Fix pricing, WhatsApp number |
| `src/pages/Pricing.tsx` | Fix FAQ answers, guarantee text |
| `src/pages/seo/*.tsx` (6 files) | Fix pricing/trial mentions |
| `src/pages/DemoStoreFront.tsx` | Fix trial mention |
| `src/components/tours/tourSteps.ts` | Fix trial mention |
| `src/pages/seo/SEOPageTemplate.tsx` | Fix CTA text |
| `src/pages/ShopStorefront.tsx` | Enhance Pro/Business SEO |

