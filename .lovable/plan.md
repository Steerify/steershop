

# Plan: Dashboard Fixes, Admin CRUD, Notifications, Logistics, WhatsApp Auto-Send, Video Upload, and General Audit

## 1. Dashboard Revenue/Sales & Banner Consolidation

**Revenue/Sales:** Already computed from real `paidOrders` data (lines 321-334 of Dashboard.tsx). Showing ₦0/0 means zero paid orders exist. No code fix needed — this is working correctly.

**Banner Merge:** The WhatsApp Community banner (lines 709-731) sits above the carousel (lines 733-763) as two separate blocks. Merge the WhatsApp banner into the carousel as another slide inside `getCarouselSlides()`. This reduces visual clutter.

**Hide carousel arrows on mobile, enable swipe:** Remove the left/right arrow buttons on `md:hidden` screens. Add touch swipe support using `onTouchStart`/`onTouchEnd` handlers to detect horizontal swipe gestures and call `nextSlide`/`prevSlide`.

**Files:** `src/pages/Dashboard.tsx`

---

## 2. Admin Marketing & GBP — Full CRUD

Currently the admin panel only supports **Read** and **Update** on both Consultations and GBP submissions. Missing: **Create** and **Delete**.

Add:
- A "New Consultation" button that opens a dialog to create a marketing service record (select shop, service type, notes, optional schedule)
- A "New GBP Submission" button for manually entering a GBP record
- Delete buttons on both tables with confirmation dialogs
- For GBP: add a detail view dialog showing all fields (description, attributes, images, verification docs) not just business name/address

**Files:** `src/pages/admin/AdminMarketingConsultations.tsx`

---

## 3. Notification Full Read View

Currently `NotificationBell.tsx` shows `line-clamp-2` on the description (line 95), truncating long notifications. When a user clicks a notification, show the full content.

Add an `expandedId` state. When a notification is clicked, toggle expansion to show the full description text instead of the 2-line clamp.

**Files:** `src/components/NotificationBell.tsx`

---

## 4. Terminal Africa Logistics — Real Integration

The Terminal Africa API is already integrated in 3 edge functions (`logistics-get-rates`, `logistics-book-delivery`, `logistics-track`) with the `TERMINAL_API_KEY` secret configured. The code already calls the real API when the key exists and falls back to mock data otherwise.

**What needs fixing:**
- The `logistics-get-rates` function uses the correct Terminal Africa v1 API but constructs addresses/parcels/rates in separate calls. Per the Terminal Africa docs, the proper flow is: Create addresses → Create parcel → Create shipment (draft) → Get rates. The current implementation does this correctly.
- The `logistics-book-delivery` function creates a shipment with just `rate_id`, but per the docs it needs `address_from`, `address_to`, and `parcel` as well. Update to pass the full shipment creation payload.
- Add "Arrange Pickup & Delivery" call after shipment creation to actually dispatch the shipment (the current code only creates a shipment but doesn't arrange the pickup).
- Ensure the delivery UI in Orders.tsx shows Terminal Africa rates alongside the manual option, and allows the shop owner to select a carrier and book directly.

**Files:** `supabase/functions/logistics-book-delivery/index.ts`, `supabase/functions/logistics-get-rates/index.ts`

---

## 5. Automatic WhatsApp Order Notification (No Customer Button Press)

**Reality check:** WhatsApp does not have a free API that allows sending messages without user interaction from a web browser. The `whatsapp://send` and `api.whatsapp.com/send` URLs always open WhatsApp with a pre-filled message that the user must manually press "Send" on. This is a WhatsApp security requirement.

**Best available solution:** Use the WhatsApp Business API (Cloud API) via a backend edge function to send order notifications directly to the shop owner's WhatsApp number without any button press. This requires:
1. A WhatsApp Business API account with Meta
2. A pre-approved message template
3. The `WHATSAPP_BUSINESS_TOKEN` secret

**Alternative (no extra setup):** Since email notifications are already working via `order-notifications` edge function, enhance that flow to also send an automatic WhatsApp-style notification via the existing Termii SMS API (which already has `TERMII_API_KEY` configured). This would send an SMS/WhatsApp message to the shop owner automatically when an order is placed — no customer action required.

**I need your input:** Do you have a WhatsApp Business API account with Meta, or should I use the Termii API (already configured) to send automatic SMS notifications to shop owners when orders come in?

---

## 6. Video Upload Fix

The `VideoUpload.tsx` component (line 37-39) has very restrictive limits: `maxDurationSeconds = 10` and `maxSizeMB = 20`. These defaults are likely too restrictive for product videos.

**Fixes:**
- Increase default `maxDurationSeconds` to 60 seconds (1 minute) and `maxSizeMB` to 50MB
- In `Products.tsx`, pass `maxDurationSeconds={60}` and `maxSizeMB={50}` to `VideoUpload`
- On the storefront (`ShopStorefront.tsx`, `ProductDetails.tsx`), add video preview that auto-plays the first 5 seconds muted, then pauses. Show a play button overlay for full playback.
- Debug the actual upload error — check if the `product-videos` storage bucket has a file size limit configured that's blocking uploads. May need to update bucket policy.

**Files:** `src/components/VideoUpload.tsx`, `src/pages/Products.tsx`, `src/pages/ShopStorefront.tsx`, `src/pages/ProductDetails.tsx`

---

## 7. General Functionality Audit & Fixes

Systematic check of all major flows:

- **Subscription flow:** Verify `paystack-initialize` and `paystack-verify` handle the new Growth/Pro pricing with correct plan slugs
- **Checkout flow:** Ensure Paystack checkout, bank transfer, and pay-on-delivery all complete correctly
- **Product CRUD:** Verify create/edit/delete with images, videos, and discount pricing
- **Order management:** Verify status updates, approval dialog, invoice generation
- **Auth flow:** Verify signup, login, password reset, and role selection
- **Mobile responsiveness:** Spot-check key pages on mobile viewport
- **Edge function auth:** Verify all functions validate user tokens properly

This will be done via code review and browser testing after implementation.

---

## Summary

| # | Feature | Files | Need Input? |
|---|---------|-------|-------------|
| 1 | Merge WhatsApp banner into carousel + swipe | `Dashboard.tsx` | No |
| 2 | Full CRUD for Marketing & GBP admin | `AdminMarketingConsultations.tsx` | No |
| 3 | Expandable notification content | `NotificationBell.tsx` | No |
| 4 | Fix Terminal Africa logistics booking | `logistics-book-delivery/index.ts` | No |
| 5 | Auto WhatsApp/SMS order notifications | New or existing edge function | **Yes — WhatsApp Business API or Termii SMS?** |
| 6 | Fix video upload limits + storefront preview | `VideoUpload.tsx`, `Products.tsx`, storefront pages | No |
| 7 | General audit & fixes | Multiple files | Will flag issues found |

