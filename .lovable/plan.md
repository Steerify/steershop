

# Plan: Storefront Functionality Audit, Google One Tap Fix, and Auth Page Cleanup

## Issues Found

### A. Google One Tap — Shows Everywhere, Should Only Show on Homepage
Currently `<GoogleOneTap />` is rendered globally in `App.tsx` (line 118), meaning it appears on every page including the login page. Per the user's request:
- It should **only** appear on the homepage (`/`)
- On the auth/login page, it's redundant since `GoogleSignInButton` is already rendered inline

**Root cause of "not working":** The component depends on `VITE_GOOGLE_CLIENT_ID` env var (line 56 of GoogleOneTap.tsx). If this isn't set, the component silently does nothing. Additionally, Lovable Cloud has managed Google OAuth — the One Tap component uses `supabase.auth.signInWithIdToken` which requires the Google client ID to match what's configured in the backend. The `GoogleSignInButton` on the auth page has the same dependency.

**Fix:** Move `<GoogleOneTap />` from `App.tsx` into `Index.tsx` only. This ensures it only appears on the homepage.

### B. Auth Page — Stale "15-day free trial" Text
Line 280 of `Auth.tsx` still says `"15-day free trial — no card needed"`. This was supposed to be updated to "Free forever plan" per previous pricing sync work but was missed.

### C. Storefront Functionality Audit

**Working correctly:**
1. **Product browsing** — filtering by type (product/service), search, responsive grid
2. **Add to cart** — stock validation, quantity limits enforced
3. **Checkout flow** — form validation with Zod, order creation in database, Paystack split payment via backend edge function, bank transfer proof via WhatsApp, delivery-before-payment option
4. **Wishlist** — uses `WishlistButton` component (requires auth)
5. **Product reviews** — inline `ProductReviewForm` on each card
6. **Booking dialog** — for service-type products with `booking_required`
7. **SEO** — JSON-LD injection, meta tags, canonical URLs
8. **White-label branding** — premium/trial shops show their own name/logo in Navbar
9. **Trust badges** — verification, WhatsApp, ratings displayed
10. **Floating cart bar** — IntersectionObserver shows it when header cart scrolls out of view

**Security review:**
- Orders insert uses `customer_id: user?.id || null` — allows guest checkout (correct for storefront)
- RLS on orders table likely permits inserts (since guests can order). Verified via `order_exists` and `shop_has_valid_subscription` security definer functions
- Stock reduction handled by `reduce_product_stock` trigger — prevents overselling
- Coupon validation done server-side via `couponService.validateCoupon`
- Paystack payment initialized via edge function (`paystack-initialize-order`) — keys never exposed to client

**No critical issues found in storefront functionality.**

---

## Plan

### 1. Move Google One Tap to Homepage Only
- **`App.tsx`**: Remove `<GoogleOneTap />` from global render and its import
- **`Index.tsx`**: Import and render `<GoogleOneTap />` inside the Index component

### 2. Fix Auth Page Trial Text
- **`Auth.tsx` line 280**: Change `"15-day free trial — no card needed"` to `"Free forever — no card needed"`

### 3. Verify Google OAuth Configuration
- Check if `VITE_GOOGLE_CLIENT_ID` is set. If not, the Google buttons and One Tap will silently fail. Will check secrets and advise.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Remove `GoogleOneTap` import and component |
| `src/pages/Index.tsx` | Add `GoogleOneTap` component |
| `src/pages/Auth.tsx` | Fix "15-day free trial" text |

