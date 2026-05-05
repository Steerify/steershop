# Plan: One-Shot Page Auto-Scroll + Admin Shops Mobile Polish

## 1. Featured Stores Carousel — auto-scroll page into view only once

**File:** `src/components/FeaturedStoresHeroCarousel.tsx`

**Keep autoplay exactly as it is** (continuous 5s loop, infinite). The only thing to change is the page-viewport scroll behavior.

Currently the active-slide sync uses `track.scrollTo({ left, behavior: "smooth" })`, which scrolls the inner track only. That's fine. But on first mount/return, the user wants the page to scroll the carousel into view **once** so it's visible — and never again on subsequent auto-swipes.

Changes:
- Add a `hasScrolledIntoViewRef = useRef(false)` flag.
- Add a one-shot effect that runs after the carousel mounts and slides have loaded: if `!hasScrolledIntoViewRef.current`, call `containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })` once, then set the ref to `true`.
- The existing per-slide-change effect remains as a pure internal `track.scrollTo` (no `scrollIntoView`), so subsequent auto-swipes never pull the page back to the carousel.
- Component remount on route return naturally resets the ref → behavior repeats on return visits.

No autoplay logic, no slide rendering, no styling touched.

## 2. Admin Shops — show product count per shop (mobile + desktop)

**File:** `src/pages/admin/AdminShops.tsx`

Currently `fetchShops` pulls shops + profiles but no product count.

Changes:
- After fetching shops, query `products` filtering `shop_id IN (...)` selecting only `shop_id`, build a `Map<shop_id, count>` client-side, attach `product_count` to each combined shop object.
- **Mobile card** (~line 682): under the shop name/owner row, add a small inline chip `📦 12 products` matching the existing chip styling.
- **Desktop table**: add a "Products" column between "Owner" and "Email" with a small badge.

## 3. Admin Shops — replace mobile "More" dropdown with bottom sheet

The current `DropdownMenu` (lines 727–764) opens as a tiny floating menu — cramped on a 360px viewport and clipped near screen edges.

Changes:
- On the mobile card only, swap `DropdownMenu` for shadcn `Sheet` with `side="bottom"`. Desktop table dropdown stays unchanged.
- Sheet contents: same actions (Edit Details, View Owner, plan label, Extend Sub, Reset Trial, Delete Shop) as full-width rows with min 48px tap targets, separators between groups, destructive Delete in red at the bottom, and a Cancel button.
- Sheet header shows the shop name + status badge so the admin knows which shop they're acting on.

## 4. Other admin info worth surfacing on mobile cards

Small additive text rows on the AdminShops mobile card (no layout risk):
- Subscription plan name (Starter / Growth / Pro) — currently buried inside the dropdown.
- Joined date ("Joined 12 Apr").
- WhatsApp number (currently desktop-only).

## Out of scope

- Carousel autoplay logic (stays as-is, infinite loop).
- No DB migrations.
- No changes to `Index.tsx` hero text rotator.
- No changes to `ShopStorefront.tsx` or other admin pages.

## Acceptance

- Visiting `/` smoothly scrolls the Featured Stores carousel into view **once** after mount; subsequent auto-swipes never tug the page back.
- Navigating away and returning replays the one-shot scroll-into-view.
- `/admin/shops` mobile cards show product count, plan, joined date, and WhatsApp; tapping "More" opens a full-width bottom sheet with comfortable tap targets.
- Desktop `/admin/shops` table gains a "Products" column; existing dropdown unchanged.
