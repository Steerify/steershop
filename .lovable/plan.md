

# Plan: Pricing Strategy, Dynamic Stats, DFY Popup Fix, and Verification Rules

## 1. Verified Shop Rule: Only Paid Plans

**Current:** Any shop can become verified if it meets order/rating thresholds. Free plan users can also get verified.

**Fix:** Add a paid-plan check to the `VerificationProgressCard` in `Dashboard.tsx`. Add a 5th criterion: "Active paid subscription". Free-plan shops cannot display the verified badge. Also update the verification logic so `is_verified` is only granted to paid users.

**Files:** `src/pages/Dashboard.tsx` (VerificationProgressCard component)

---

## 2. Dashboard Revenue & Sales — Already Backend-Driven

Looking at the code (lines 346-359), `totalRevenue` and `totalSales` are already computed from real order data fetched from the database (`paidOrders` filtered by `payment_status === 'paid'`). The screenshot shows ₦0 and 0 because the shop has zero paid orders. **No change needed here.**

---

## 3. Replace Hardcoded Vendor Counts with Live Data

**Hardcoded values found:**
- `src/pages/Index.tsx` line 63: "Trusted by 2,000+ Nigerian vendors"
- `src/pages/Auth.tsx` line 305: "2,000+ active vendors"
- `src/pages/Dashboard.tsx` line 744: "Join 5,000+ vendors on WhatsApp"

**Fix:** For `Index.tsx` and `Auth.tsx`, fetch the live shop count from the `shops` table (or use the `shops_public` view) and display it dynamically. For the WhatsApp "5,000+" — this is a community number, not a DB metric, so leave it as aspirational marketing copy (or replace with a softer "growing community of vendors").

**Files:** `src/pages/Index.tsx`, `src/pages/Auth.tsx`

---

## 4. Subscription Strategy: 3 Plans + Ghost Plan

**Current state:** 4 plans — Free (₦0), Basic (₦1,000/mo), Pro (₦3,000/mo), Business (₦5,000/mo).

**Recommendation — 3 visible plans + 1 ghost:**

The "Free Trap" works best with **3 visible tiers** (cognitive simplicity) plus a hidden "ghost" plan:

| Plan | Monthly | Yearly | Products | Purpose |
|------|---------|--------|----------|---------|
| **Starter (Free)** | ₦0 | ₦0 | 5 | Hook — get users dependent |
| **Growth** (rename Basic) | ₦2,500/mo | ₦25,000/yr | 50 | Sweet spot — most users land here |
| **Pro** | ₦5,000/mo | ₦50,000/yr | Unlimited | Power users, AI, white-label |
| **Business** (Ghost) | Hidden | Contact us | Unlimited + DFY | Anchor — makes Pro look cheap |

**Why this works:**
- **Free → Growth gap is ₦2,500/mo** (~₦83/day). Affordable for any Nigerian SME generating even ₦50K/month. The 5→50 product jump is the natural trigger.
- **Growth → Pro gap is ₦2,500/mo** — same increment, easy upgrade decision. Pro unlocks AI + unlimited + branding.
- **Business as ghost plan:** Never shown on pricing page. Only mentioned in "Enterprise? Contact us" line. It anchors Pro as the top visible plan, making ₦5,000/mo feel like the premium choice. This is the psychological "ghost plan" method.
- **Current ₦1,000/₦3,000/₦5,000** pricing is too low for long-term sustainability. At 9 shops, even 100% conversion = ₦45K/mo max. The new pricing triples revenue per user while staying under ₦170/day.

**Database changes:** Update `subscription_plans` — rename Basic to Growth, adjust prices, deactivate Business plan from public display (keep it as a hidden/contact-us tier).

---

## 5. DFY Popup — Remove ₦5,000 for ≤5 Products

**Current:** The DFY popup always charges ₦5,000 regardless of product count. The title says "Add your products (1-5)" limiting to 5 max.

**Fix:**
- Remove the 5-product limit in the DFY popup — allow any number of products
- Only charge ₦5,000 when user adds MORE than 5 products (the extra is for AI-powered bulk setup)
- If ≤5 products, the store creation is **free** (no Paystack redirect) — just create the shop directly
- Update copy: "Add your products" (remove "(1-5)"), update the ₦5,000 messaging to only appear when product count exceeds 5

**Files:** `src/components/DoneForYouPopup.tsx`

---

## 6. DynamicPricing — Update Copy

**Current:** Still says "Start with a 15-day free trial" (line 152).

**Fix:** Update to "Start free. Upgrade when you grow." and remove the "15-day free trial" from the bottom text too (line 268). Also hide the Business plan from the grid (ghost plan — show "Need more? Contact us" link instead).

**Files:** `src/components/DynamicPricing.tsx`

---

## 7. Marketing Strategy (Advisory — No Code Changes)

For pushing SteerSolo and shops online:

1. **WhatsApp-first distribution:** Each shop owner shares their `steersolo.com/shop/slug` link in their existing WhatsApp status/groups. The platform grows through merchant networks, not paid ads.
2. **SEO landing pages** (already built — 6 pages targeting high-intent Nigerian keywords). Keep publishing content.
3. **AI crawler optimization** (already done — 25+ crawlers whitelisted).
4. **Referral program** (already built — Ambassador system). Incentivize with reward points.
5. **Content marketing:** Use the course system to create "How to sell on WhatsApp" tutorials that rank on Google/YouTube.
6. **Instagram/TikTok UGC:** Encourage shop owners to post their SteerSolo store links with a branded hashtag.
7. **Google Business Profile** (just built) — each merchant gets local SEO visibility.

No code changes needed for this item.

---

## Technical Summary

| # | Change | Files | Priority |
|---|--------|-------|----------|
| 1 | Verified badge only for paid plans | `Dashboard.tsx` | High |
| 2 | Revenue/sales already live | None | N/A |
| 3 | Dynamic vendor counts (replace hardcoded) | `Index.tsx`, `Auth.tsx` | High |
| 4 | 3-plan pricing + ghost Business plan | DB migration, `DynamicPricing.tsx` | High |
| 5 | DFY popup: free for ≤5 products, ₦5K for >5 | `DoneForYouPopup.tsx` | High |
| 6 | Update pricing page copy | `DynamicPricing.tsx` | Medium |

