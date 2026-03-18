

# Plan: Shopify-Style Redesign for Storefront and Homepage

## What Shopify Looks Like (Dawn Theme)
Shopify's design language is characterized by: clean white space, full-width hero images with text overlays, minimal navigation bars (logo left, nav center, search/cart/account icons right), product grids with clean card layouts (no borders, image-first), announcement bar at top, collection sections with large typography, and a very editorial/magazine feel. Products show on hover with quick-add, prices are clean, and the overall feel is spacious and premium.

## Current State
Your storefront and homepage have a more "app dashboard" feel — lots of badges, pill buttons, gradient backgrounds, card borders, and dense information. The goal is to shift toward a clean, editorial e-commerce aesthetic while keeping the Nigerian/African brand identity.

---

## Changes

### 1. ShopStorefront.tsx — Full Shopify-style redesign

**Header area:**
- Replace the card-based shop header with a full-width hero banner (edge-to-edge) with shop logo + name overlaid on the banner, Shopify style
- Move cart icon to a sticky minimal top bar (logo left, search center, cart icon right)
- Remove excessive badges (completed orders, total ratings, product/service counts) — keep only verified badge and rating
- WhatsApp contact becomes a clean icon button in the top bar

**Product grid:**
- Remove card borders and shadows — products become borderless image-first tiles
- Larger product images (aspect-ratio 4:5 like Shopify)
- Product name below image in clean typography, price underneath
- Remove "Add to Cart" button from grid — add on hover overlay or keep only on product detail page
- Remove inline review forms from product cards
- Clean pill filters become minimal text links or dropdown

**Overall layout:**
- Remove "Back to All Shops" button from product area
- Add an announcement bar at the very top (e.g., "Free delivery on orders over ₦20,000")
- Section dividers become generous whitespace instead of borders
- Footer stays but simplified

### 2. Index.tsx (Homepage) — Shopify landing page feel

**Hero:**
- Full-width hero image/video background (edge-to-edge) instead of the current split layout with Nigeria dot map
- Centered text overlay with large headline + single CTA button
- Remove the trust badges row, typewriter effect, and multiple CTAs — keep it minimal

**Sections:**
- Pain points section → Replace with a "Featured Collections" grid (show featured shops as collection images)
- WhySteerSolo/HowItWorks → Simplify to a 3-column icon+text grid with generous spacing
- Featured shops → Display as a horizontal scrollable product/shop carousel, Shopify collection style
- Remove social proof stats section (or make it a single clean line)
- Pricing section → Keep but style as clean cards with more whitespace
- Final CTA → Full-width image with text overlay, single button

### 3. DemoStoreFront.tsx — Match the new storefront style

Same structural changes as ShopStorefront but with demo data.

### 4. ProductDetails.tsx — Shopify PDP style

- Two-column layout is good (already exists)
- Make image gallery larger, add thumbnail strip below
- Clean typography for product name (larger), price (bolder)
- "Add to Cart" as a full-width prominent button
- Related products as a horizontal scroll row at bottom

### 5. Shops.tsx (Browse page) — Collection grid

- Replace the current shop cards with larger, image-dominant tiles
- Each shop tile shows the banner/logo as a full card background with shop name overlaid
- Remove excessive metadata from cards

### 6. index.css + New Shopify Utilities

Add new utility classes:
- `.shopify-grid` — borderless product grid with consistent gaps
- `.shopify-card` — no border, no shadow, image-first
- `.shopify-nav` — minimal sticky navigation
- `.announcement-bar` — top banner for promotions
- Increase base whitespace in sections (py-24 → py-32)

### 7. Navbar.tsx — Shopify-style nav

- Simplify to: Logo (left), Navigation links (center), Search + Cart + Account icons (right)
- Make it sticky with a thin border-bottom only
- Remove the heavy gradient/glass effects
- Add announcement bar above navbar

---

## Files to Edit
1. `src/pages/ShopStorefront.tsx` — Major redesign (hero header, clean product grid, minimal UI)
2. `src/pages/Index.tsx` — Full-width hero, simplified sections
3. `src/pages/DemoStoreFront.tsx` — Match storefront changes
4. `src/pages/ProductDetails.tsx` — Cleaner PDP layout
5. `src/pages/Shops.tsx` — Image-dominant shop browse grid
6. `src/components/ShopCardEnhanced.tsx` — Larger, image-first design
7. `src/components/Navbar.tsx` — Minimal Shopify-style nav
8. `src/index.css` — New Shopify utility classes, more whitespace

## Files to Create
None — all changes are refactors of existing files.

## Technical Notes
- No database changes needed — purely frontend redesign
- All existing functionality (cart, checkout, booking, wishlist, reviews) preserved
- The African brand identity (colors, Adire patterns) stays but becomes more subtle — used as accents rather than dominant patterns
- Mobile responsive maintained with Shopify's mobile-first approach
- This is a large visual overhaul spanning 8 files — recommend implementing in 2-3 rounds (storefront first, then homepage, then browse pages)

