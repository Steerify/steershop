## Goals

1. **Featured Stores Carousel** — show varied (not always the same) products per shop when more than 2 exist.
2. **Product Details page** — fully mobile-responsive (fix overflow seen in screenshots: oversized price, truncated CTAs, cramped trust badges).
3. **Storefront** — tighten mobile spacing and visual hierarchy for an app-like, world-class feel (cleaner header card, better action buttons, refined catalog cards).

## 1. FeaturedStoresHeroCarousel — Product Variety

**File:** `src/components/FeaturedStoresHeroCarousel.tsx`

- Fetch up to **8 available products** per featured shop instead of the latest 2.
- Pick **2 random products** from that pool on each load (`Math.random()` shuffle, slice 2). This way each visit shows different items, and shops with >2 products no longer feel stale.
- Shops with ≤2 products keep current behavior.

## 2. ProductDetails — Mobile Responsive Overhaul

**File:** `src/pages/ProductDetails.tsx`

Issues from screenshots: 4xl price wraps awkwardly, "Add to Cart" button + Inquire button overflow horizontally on 360px, trust banner cramped, breadcrumb clutters mobile.

Changes:
- **Hide breadcrumb on mobile** (`hidden sm:flex`); keep "Back to {shop}" button.
- **Price block**: scale heading down on mobile — `text-2xl sm:text-3xl md:text-4xl`; allow flex-wrap so badges drop cleanly under the price; switch to `flex-wrap items-center gap-2`.
- **Title**: `text-2xl sm:text-3xl md:text-4xl` (currently jumps too large on small screens).
- **CTA row redesign** (the main fix):
  - Mobile: stack as a 2-row layout — full-width "Add to Cart" on top; second row = `[Inquire | Share | Wishlist]` evenly split.
  - Desktop (`sm:`) keep current inline layout.
  - Use `flex-col sm:flex-row` with `w-full` children on mobile.
- **Trust banner**: keep 2-col grid but tighten icons/text and add `gap-2 sm:gap-4`; ensure it never overflows.
- **Related products**: reduce min-width on mobile from `78%` to `70%` so a hint of next card peeks (improves discoverability).
- **Container padding**: `px-3 sm:px-4`, `pt-20 sm:pt-24` to recover vertical space on phones.
- **Sticky mobile CTA bar (optional polish)**: add a slim fixed bottom bar on mobile only with price + "Add to Cart" once the user scrolls past the inline CTA — mirrors the storefront's existing floating bar pattern.

## 3. Storefront Mobile Polish

**File:** `src/pages/ShopStorefront.tsx`

Pain points from current code on 360px: 4-button action grid (Contact / Tour / Share / Cart) creates a cramped 2×2 block under the title; stats row wraps into many lines; marketplace explainer card is heavy.

Changes:
- **Identity card actions on mobile**: collapse to **primary row** = `[Contact | Cart]` (the two highest-intent actions), and move `Tour` + `Share` into a discrete icon-only secondary row aligned right (smaller, ghost style). Keeps the card breathable.
- **Hero card padding**: `p-3 sm:p-5 md:p-8` (currently `p-4` on mobile feels tight with so many elements).
- **Stats row**: convert to a horizontal scroll strip on mobile (`flex overflow-x-auto scrollbar-none gap-2 -mx-1 px-1`) so badges don't wrap into 3 messy lines; desktop keeps wrap behavior.
- **Marketplace explainer**: reduce mobile prominence — smaller padding (`p-4 md:p-6`), 1-line headline on mobile, hide the long descriptive paragraph behind `hidden sm:block`. Keep the CTA button.
- **Catalog toolbar**: on mobile, the title "Catalog" + Sparkles icon competes with Back+Search. Drop the "Catalog" word on mobile (keep icon only) so the search input has room.
- **Product card refinements** (subtle, no breaking changes):
  - Use a single CTA row on mobile: one "Add to Cart" button + a small wishlist heart icon button (currently the 2nd row has Details + Wishlist which doubles up since the whole image is already a Details link).
  - Hide the redundant "Details" button on mobile (`hidden sm:flex`); keep on desktop.
  - Tighten card padding `p-2.5` → `p-3` and increase title size baseline to `text-sm` for legibility.
- **Floating bar**: add safe-area bottom padding fix (`pb-[env(safe-area-inset-bottom)]`) so it sits above iOS home bar.

## Technical Notes

- All visual changes are CSS/Tailwind-only — no schema, no API, no behavior breakage.
- Carousel randomization uses Fisher-Yates shuffle on the client; the fetched product pool stays small (8) so cost is negligible.
- No changes to autoplay, scroll-into-view (already one-shot), or admin pages.
- Tested mentally against 360×632 viewport (current preview) and standard breakpoints `sm: 640`, `md: 768`, `lg: 1024`.

## Out of Scope

- No redesign of CheckoutDialog, BookingDialog, or Navbar.
- No copy changes to marketing text.
- Admin pages untouched.
