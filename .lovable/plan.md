

# Plan: Multi-Feature Update — Video Fix, Notifications, Domain, Floating Cart, and More

This is a large batch of changes. Here's the breakdown organized by priority.

---

## 1. Fix Product Video Display on Owner's Product Card (`Products.tsx`)

**Issue:** Product cards on the owner dashboard (lines 470-491) only show images. When a product has a `video_url` but no image, the card shows a generic icon. When it has both, only the image shows with a small play icon — but the video never plays.

**Fix:** When `product.video_url` exists and no image exists, render a `<video>` tag (muted, loop, autoPlay, playsInline) as the card thumbnail — matching what the storefront already does (ShopStorefront line 708-716). When both exist, show the image with a clickable play overlay that opens a video modal.

**Files:** `src/pages/Products.tsx`

---

## 2. Replace `steersolo.lovable.app` with `steersolo.com` Everywhere

**Files affected (9 files, 87 occurrences):**
- `src/components/SEOSchemas.tsx`
- `src/components/ReferralCard.tsx`
- `src/pages/FAQ.tsx`
- `src/pages/MyStore.tsx`
- `src/pages/ShopStorefront.tsx`
- `src/pages/seo/SellOnlineNigeria.tsx`
- Plus remaining SEO pages

Simple find-and-replace across all files.

---

## 3. Floating Cart & Contact Button on Storefront (`ShopStorefront.tsx`)

**What:** When a customer adds to cart and scrolls down past the header, show a floating bottom bar with cart count + "Contact Us" button. It disappears when user scrolls back to the top (where the header cart button is visible).

**Implementation:** Add a scroll listener with `IntersectionObserver` on the header cart area. When it's out of viewport, show a fixed bottom floating bar. When it's in viewport, hide it.

**Files:** `src/pages/ShopStorefront.tsx`

---

## 4. Feedback Popup for First-Time Shop Owners & Customers

**What:** A small, one-time notification popup when:
- A shop owner opens their dashboard for the first time
- A customer visits any storefront for the first time

The popup says something like "Enjoying SteerSolo? We'd love your feedback!" with a button linking to `/feedback`.

**Implementation:** Use `localStorage` flag (`steersolo_feedback_prompted`). Show a small toast-like popup after 5 seconds on first visit. Dismissible with "Later" and "Give Feedback" buttons.

**Files:** New component `src/components/FeedbackPrompt.tsx`, integrate into `Dashboard.tsx` and `ShopStorefront.tsx`

---

## 5. Free Plan Users: Store Visibility Even After Trial Expiry

**Current behavior:** The subscription util marks users as "expired" when trial ends. This may hide their shop.

**What to change:**
- Users with ≤5 products are on the free plan — their store stays visible in `/shops` and accessible via direct link regardless of subscription status.
- When a free trial expires, show a popup: "Your trial has ended. Choose to continue free (5 products) or upgrade." with a button to `/pricing`.
- Free trial users get link personalization (logo/name in navbar). Free plan users (post-expiry, chose free) do NOT get personalization.

**Files:** `src/utils/subscription.ts`, `src/pages/Dashboard.tsx` (trial expiry popup), `src/pages/ShopStorefront.tsx` (navbar branding logic)

---

## 6. Verified Badges for Current Featured Businesses

**What:** Grant verified status to all current active shops as early adopter privilege.

**Implementation:** Database UPDATE to set `is_verified = true` for all 9 current active shops.

---

## 7. Verified Seller Safety Notice for Customers

**What:** A small popup/banner shown to customers on the `/shops` page encouraging them to choose verified sellers for safety.

**Files:** `src/pages/Shops.tsx` — add a dismissible info banner at top

---

## 8. Order Email Notification (Gmail Delivery)

**Current state:** Orders go to WhatsApp via `order-notifications` edge function. The function already supports email via `send-notification-email`.

**What to add:** When an order is placed, also send the order details to the shop owner's email (from their profile). This happens automatically — no user action needed. The WhatsApp link is still generated for the customer to optionally send.

**Files:** `supabase/functions/order-notifications/index.ts`, `src/components/CheckoutDialog.tsx`

---

## 9. Sales Milestone Celebration Popup

**What:** When a shop owner reaches their 1st sale, 10th, 20th, 30th... (increments of 10), show a celebration popup with confetti.

**Implementation:** Check total completed orders on dashboard load. Compare against milestones stored in `localStorage`. If a new milestone is reached, show a celebratory dialog with `react-dom-confetti`.

**Files:** New component `src/components/SalesMilestonePopup.tsx`, integrate into `Dashboard.tsx`

---

## 10. Shop Location Info Update

**Current state:** Shops have `state` and `country` fields. The `ShopStorefront` displays them. The `MyStore` page may not have proper location fields.

**What:** Ensure `MyStore.tsx` has proper state/city selection fields and that the shop card in `/shops` also shows location.

**Files:** `src/pages/MyStore.tsx`, `src/components/ShopCardEnhanced.tsx`

---

## Technical Summary

| # | Feature | Files | Priority |
|---|---------|-------|----------|
| 1 | Fix video on product cards | `Products.tsx` | High |
| 2 | Domain replacement | 9 files | High |
| 3 | Floating cart/contact | `ShopStorefront.tsx` | High |
| 4 | Feedback popup | New component + `Dashboard.tsx`, `ShopStorefront.tsx` | Medium |
| 5 | Free plan store visibility + trial expiry popup | `subscription.ts`, `Dashboard.tsx`, `ShopStorefront.tsx` | High |
| 6 | Verified badges for current shops | Database UPDATE | Medium |
| 7 | Verified seller notice | `Shops.tsx` | Low |
| 8 | Order email notification | `order-notifications/index.ts`, `CheckoutDialog.tsx` | Medium |
| 9 | Sales milestone popup | New component + `Dashboard.tsx` | Medium |
| 10 | Location fields | `MyStore.tsx`, `ShopCardEnhanced.tsx` | Low |

