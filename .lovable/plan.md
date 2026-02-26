# Plan: Free Trap Pricing Strategy + Homepage & Branding Refinements

## Analysis of Current State

### Homepage (Already Strong — Minor Tweaks Only)

The current homepage already follows the $100M Offers value equation and Diary of a CEO storytelling principles:

- **Dream Outcome:** "Turn WhatsApp traffic into completed orders in 14 days"
- **Perceived Likelihood:** Social proof stats, live featured shops, reviews
- **Time Delay:** "10-minute setup", "60 seconds" signup
- **Effort/Sacrifice:** "No credit card", "No technical skills"
- **Pain Mirror:** The 3 chaos cards hit emotional triggers
- **Risk Reversal:** "14-day guarantee or next month free"
- **10-section conversion funnel** is already well-structured

**Verdict:** The homepage is solid. Only minor copy refinements needed (strengthen the guarantee language, add a "free forever" tier callout in the hero).

### Pricing ("Free Trap" — Major Change Needed)

Warren Buffett's "Free Trap" principle: give away genuine value for free so users become dependent, then monetize the upgrade. Currently there is NO free plan. All 3 plans cost money. The `DynamicPricing` component explicitly filters out free plans (`.gt('price_monthly', 0)`).

**What needs to change:**

1. Create a **Free Forever** plan in the database (₦0/month, 5 products, basic features)
2. Update `DynamicPricing` to show the free plan
3. Update `Pricing.tsx` to include free plan profile
4. Restructure plan presentation: Free → Basic → Pro → Business

### Navbar Branding (Already Working — Tiny Fix)

The `shopBranding` prop system works. The logo links to `/` which is the SteerSolo homepage. One small issue: on the screenshot the user shared, the navbar shows "SteerSolo" — this is the default homepage view, NOT a shop storefront. The branding swap only applies on `/shop/:slug` routes where the `ShopStorefront` passes branding to the Navbar. This is correct behavior.

---

## Changes

### 1. Database: Create Free Forever Plan

Add a new subscription plan row:

- **Name:** Starter (Free)
- **Slug:** free
- **Price:** ₦0/month, ₦0/year
- **Max Products:** 5
- **Features:** Up to 5 products, Store link sharing, WhatsApp order link, Basic product catalog, Bank transfer payments
- **Display Order:** 0 (shows first)

### 2. `src/components/DynamicPricing.tsx` — Show Free Plan

- Remove the `.gt('price_monthly', 0)` filter so the free plan appears
- Add special styling for the free plan (green "FREE" badge, "₦0 forever" price display)
- Add "Free Forever" CTA button text instead of "Start 15-Day Free Trial"
- Add plan meta for `free` slug

### 3. `src/pages/Pricing.tsx` — Add Free Plan Profile

- Add `free` entry to `planProfiles` with: bestFor, outcome, timeSaved
- Update hero copy to emphasize "Start free, upgrade when you grow"

### 4. `src/pages/Index.tsx` — Minor Hero Refinements

- Update the trust chip from "15-day free trial" to "Free forever plan available"
- Update the CTA button text from "Start Free — No Card Needed" to "Start Free Forever"
- Add a small line under the hero about the free tier to reinforce the free trap
- Update the final CTA section to mention the free plan

### 5. `src/components/FinalCTASection.tsx` — Update Trust Points

- Change "7-day free trial" to "Free forever plan" (it's currently inconsistent — says 7-day while the rest of the site says 15-day)

### 6. `src/components/SubscriptionCard.tsx` — Handle Free Plan

- For the free plan, show "Get Started Free" button instead of "Subscribe to..."
- Don't redirect to Paystack for free plan — instead redirect to signup

---

## Technical Summary


| Priority | File                   | Change                                                  |
| -------- | ---------------------- | ------------------------------------------------------- |
| High     | Database migration     | Create "Starter (Free)" plan with 5 products, ₦0        |
| High     | `DynamicPricing.tsx`   | Remove price > 0 filter, add free plan styling          |
| High     | `Pricing.tsx`          | Add free plan profile, update hero copy                 |
| Medium   | `Index.tsx`            | Update hero trust chips and CTA copy for free trap      |
| Medium   | `SubscriptionCard.tsx` | Handle free plan CTA (redirect to signup, not Paystack) |
| Low      | `FinalCTASection.tsx`  | Fix inconsistent trial duration text                    |
