

# Plan: White-Label Branding Enforcement, Ads Deep-Link Posting, and Competitive Alignment

## Issues Found

### A. White-Label Branding — Partially Working, Gaps Exist
- **ShopStorefront.tsx (line 457):** Already passes `shopBranding` to Navbar for `isPremiumPlan` (pro/business). This works correctly — the Navbar shows shop name + logo instead of SteerSolo. **Confirmed working.**
- **Gap:** The `isPremiumPlan` check requires `subscription_plan_id` to be set on the profile AND the plan slug to be `pro` or `business`. If a user is on trial (no plan assigned yet), `ownerPlan.slug` is `null` → white-label won't show even though they're in trial. Per memory, trial users should also get white-label.
- **Gap:** When a customer is browsing (not the owner), the Navbar `Link to="/"` always goes to SteerSolo homepage. For premium shops, this should link to the shop itself (or at minimum stay on the storefront).

### B. Ads Assistant — Generates Copy but Doesn't Actually Post
The current flow: Generate AI copy → Copy to clipboard → "Launch on [Platform]" button opens the platform's generic campaign creation page. The user then has to manually paste the copy.

**Reality check against competitors (Bumpa):** Bumpa also doesn't auto-post ads — they generate copy and link to Meta Ads Manager. No Nigerian platform actually auto-posts because it requires full OAuth integration with Meta Business API, Google Ads API, and TikTok Marketing API — each requiring business verification, developer accounts, and approved ad accounts.

**What we CAN improve:**
- For **WhatsApp**: Already works — opens `wa.me/?text=...` with pre-filled text. Good.
- For **Facebook/Instagram**: Pre-fill the copy into the clipboard AND open the correct campaign creation URL. Add a step-by-step instruction card showing exactly where to paste.
- For **TikTok**: Same approach — clipboard + launch + instructions.
- For **Google Ads**: Same approach.
- Add a "Share to WhatsApp Status" option (different from broadcast) — `whatsapp://send?text=...`
- Add a "Share to Instagram Story" deep link option (limited but possible via clipboard + story camera link)

### C. Competitive Analysis — SteerSolo vs Bumpa (Main Nigerian Competitor)

| Feature | Bumpa | SteerSolo | Gap |
|---------|-------|-----------|-----|
| Mobile app | Yes (iOS/Android) | Web only | Major — consider PWA |
| WhatsApp integration | Deep (auto-messages, catalog sync) | Basic (link sharing) | Medium |
| Inventory management | Advanced (multi-location, low-stock alerts) | Basic (stock count) | Medium |
| AI tools | AI product descriptions, business insights | AI ads, shop analysis, product descriptions | On par |
| Payment processing | Paystack, transfers | Paystack, transfers, bank | On par |
| Social media ads | Copy generation + link to Meta | Copy generation + link to platforms | On par |
| Website/storefront | Custom domain, extensions, themes | Slug-based storefront | Medium gap |
| Analytics | Revenue, customer, product analytics | Basic dashboard stats | Medium |
| Delivery integration | Multiple carriers | Terminal Africa | On par |
| Pricing | Free plan, paid from ₦3,900/mo | Free plan, paid from ₦2,500/mo | Competitive |

**Key takeaway:** SteerSolo is competitive on price and AI features. Biggest gaps are: (1) no mobile app/PWA, (2) limited WhatsApp automation, (3) no custom domains.

---

## Plan

### 1. Fix White-Label for Trial Users
**`ShopStorefront.tsx`:** Expand `isPremiumPlan` check to also include users who are in trial period (`subscription_expires_at > now()` and `is_subscribed = false`). Fetch `is_subscribed` and `subscription_expires_at` alongside `subscription_plan_id` in the `loadShopData` function.

**`Navbar.tsx`:** When `shopBranding` is provided, make the logo link go to the current page (or the shop slug) instead of always linking to `/`.

### 2. Improve Ads Assistant — Add Post-Generation Guidance
**`AdsAssistant.tsx`:** After generating copy (Step 3), add a collapsible "How to Post This Ad" instruction card per platform:
- **WhatsApp:** Already has share button. Add "Share as Status" button too.
- **Facebook/Instagram:** Show 3-step visual guide: "1. Copy text above → 2. Click Launch → 3. Paste in Primary Text field". Auto-copy all text before opening link.
- **TikTok:** Show instructions for TikTok Ads Manager.
- **Google Ads:** Show instructions for responsive search ads.

Also: When "Launch on [Platform]" is clicked, auto-copy all text to clipboard first, then open the link. Currently it only opens the link.

### 3. No Major Structural Changes Needed
SteerSolo is reasonably competitive. The gaps (mobile app, custom domains) are infrastructure-level and not quick fixes. What IS actionable:
- Already have PWA basics (`robots.txt`, `favicon`). Could add a `manifest.json` for installability — but that's a separate task.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/ShopStorefront.tsx` | Expand `isPremiumPlan` to include trial users |
| `src/components/Navbar.tsx` | When `shopBranding` is set, logo links to current page instead of `/` |
| `src/pages/entrepreneur/AdsAssistant.tsx` | Auto-copy before launch, add per-platform posting instructions |

