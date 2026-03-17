

# Plan: Subscription Expiry Popup, Homepage Alignment, and Logistics Verification

## 1. Subscription Expiry / Free Plan Persuasion Popup

Create a new component `src/components/SubscriptionExpiryDialog.tsx` that shows when a shop owner's trial/subscription has expired. This dialog will be triggered from `Dashboard.tsx` after data loads.

**Logic flow:**
- After `loadData()` completes, check `subscriptionStatus === 'expired'`
- Show a persuasive full-screen dialog with two paths:
  - **"Upgrade to a Paid Plan"** — navigates to `/pricing`
  - **"Stay on Free Plan (5 products max)"** — if `productsCount > 5`, show a product list with delete buttons so the user can trim down to 5. If `productsCount <= 5`, show a persuasive "you're missing out" message but allow them to dismiss
- Even if products are <= 5, still show the dialog once per session (use `sessionStorage` to avoid repeat)
- The dialog should be beautifully designed with gradient backgrounds, clear value propositions for upgrading, and a sense of urgency

**Also show for `subscriptionStatus === 'free'`:** A lighter persuasion popup (not blocking) that appears once per day (tracked via `localStorage` timestamp) encouraging upgrade with feature comparisons.

**Files:** New `src/components/SubscriptionExpiryDialog.tsx`, edit `src/pages/Dashboard.tsx`

---

## 2. Homepage Alignment — Fix Inconsistencies

Review current Index page claims vs actual system capabilities:

**Issues found:**
- "Proven 30-Day Ritual" chip in hero — this exists (StructuredSellingChallenge), accurate
- "Sell Globally from Africa" — the system only supports NGN payments via Paystack currently. The "From Africa to the World" section claims "Multi-Currency" and "Global Reach" which is misleading
- "setup takes 10 minutes" — accurate
- HowItWorks says "15-day free trial" but the pricing strategy is "Free Forever" (Starter plan) — inconsistent
- Final CTA says "Get your first order within 14 days — or your next month is free" — this guarantee isn't enforced in the system
- "Free forever plan" in footer chips — accurate per pricing strategy

**Fixes:**
- Remove the "From Africa to the World" section (Section 1.5) since multi-currency/global payments aren't implemented
- Update HowItWorks step 1 description from "15-day free trial" to "Free forever with up to 5 products"
- Soften the Final CTA guarantee to something achievable: "Get your first order within 14 days" without the "next month is free" promise (unless you want to enforce it)
- Keep the hero as-is — "Turn WhatsApp traffic into consistent orders" is accurate

**Files:** `src/pages/Index.tsx`, `src/components/HowItWorks.tsx`

---

## 3. Logistics Function Verification

The `logistics-get-rates` and `logistics-book-delivery` edge functions are correctly structured for the Terminal Africa API. The flow is: Create addresses → Create parcel → Get rates / Create shipment → Arrange pickup.

**Current status:** The code is correct. The only issue is that without a valid `TERMINAL_API_KEY`, it falls back to mock data. The `TERMINAL_API_KEY` secret is already configured. The functions should work if the key is valid and the Terminal Africa account is active.

**Small fix needed:** The `logistics-get-rates` function hardcodes `country: 'NG'` — should use the `country` field from the address if provided. Also add better error messages when Terminal API returns errors (currently just throws generic "Failed to create pickup address").

**Files:** `supabase/functions/logistics-get-rates/index.ts`, `supabase/functions/logistics-book-delivery/index.ts`

---

## Summary

| # | Feature | Files | Effort |
|---|---------|-------|--------|
| 1 | Subscription expiry persuasion popup | New component + `Dashboard.tsx` | Medium |
| 2 | Homepage consistency fixes | `Index.tsx`, `HowItWorks.tsx` | Small |
| 3 | Logistics error handling improvement | 2 edge functions | Small |

