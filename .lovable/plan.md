

# Plan: Spotify-Inspired Design Refresh, Share Card, Nigeria Map, and Storefront Customization

This is a large, multi-part plan covering 4 distinct workstreams. The approach is to apply the bold Spotify aesthetic consistently, add a Paystack-inspired Nigeria dotted map to the hero, build a share card for storefronts, and wire up the existing DB columns for premium storefront customization.

---

## 1. Nigeria/Africa Dotted Map on Homepage Hero (Paystack-Inspired)

The user wants a dark green/grey dotted outline of Nigeria (or Africa) in the hero section, similar to Paystack's homepage map.

**File: `src/components/NigeriaDotMap.tsx`** (new)
- Create an SVG component rendering Nigeria's outline using a dot-matrix pattern (small circles arranged to form the country shape)
- Use `hsl(var(--accent) / 0.15)` for dots in light mode, brighter in dark mode
- Add 3-4 animated "pulse" markers on key cities (Lagos, Abuja, Port Harcourt)
- Each pulse marker has a subtle `animate-ping` ring effect
- Animated dashed connection lines radiating outward (like Paystack's style)

**File: `src/pages/Index.tsx`**
- Import `NigeriaDotMap` and position it absolutely in the hero section (right side on desktop, behind content on mobile)
- Adjust hero to a two-column layout on `lg:` screens: text left, map right (like Paystack)

---

## 2. Storefront Share Button & Share Card

**File: `src/components/ShareStorefront.tsx`** (new)
- A `Share` button component placed in the storefront header
- On click, opens a modal/sheet with a beautifully designed share card showing:
  - Shop logo, name, description, rating, product count
  - QR code linking to the storefront
  - Gradient background with brand colors
  - "Scan to shop" CTA text
- Two actions: **Copy Link** and **Share** (uses Web Share API with fallback)
- The card itself is rendered as a styled div that could be screenshotted

**File: `src/pages/ShopStorefront.tsx`**
- Add `<ShareStorefront>` button in the header actions area (next to Contact, Tour, Cart)

---

## 3. Shopify-Like Storefront Customization (Pro/Business Only)

The `shops` table already has: `primary_color`, `secondary_color`, `accent_color`, `font_style`, `theme_mode`. These just need to be wired up.

### 3a. Customization UI in MyStore Settings

**File: `src/components/StorefrontCustomizer.tsx`** (new)
- A card/section shown only to Pro/Business plan users in MyStore
- Controls for:
  - **Accent Color**: Color picker from 8-10 preset brand colors (not freeform — keeps it clean)
  - **Font Style**: Dropdown with 4-5 Google Font options (Poppins, Inter, Playfair Display, Space Grotesk, DM Sans)
  - **Layout Density**: Compact (4-col grid) vs Comfortable (3-col grid) — stored in `theme_mode`
- Save button that updates the `shops` table
- Live preview swatch showing chosen color + font combo

**File: `src/pages/MyStore.tsx`**
- Import and render `<StorefrontCustomizer>` inside the store settings, gated behind `isPremiumPlan` check

### 3b. Apply Customizations on Storefront

**File: `src/pages/ShopStorefront.tsx`**
- Fetch `accent_color`, `font_style`, `theme_mode` from shop data (already available)
- Apply as CSS custom properties on the storefront wrapper via `style` prop:
  - `--shop-accent: <accent_color>` overrides accent on buttons, badges, gradients
  - Google Font loaded dynamically via `<link>` tag injection
  - Grid columns adjusted based on `theme_mode` (compact/comfortable)

---

## 4. Spotify-Inspired Design Refresh for All Remaining Pages

Apply the established Spotify design language (borderless rounded-2xl cards, subtle shadows, scale hover, pill buttons, generous spacing, glass effects) to all pages not yet updated.

### Pages to Update (design-only, no content changes):

**Public pages** (wrapped in Navbar + Footer):
- `Index.tsx` — Hero already has mesh bg; update pain point cards, section backgrounds to use `card-spotify` style, rounded-2xl cards, remove visible borders
- `AboutPage.tsx` — Replace `card-african` patterns, use gradient hero, card-spotify cards
- `FAQ.tsx` — Spotify-style accordion, pill category tabs, gradient hero
- `HowItWorksPage.tsx` / `HowItWorks.tsx` — Borderless step cards, gradient number badges
- `Pricing.tsx` — Already has DynamicPricing; update page wrapper
- `Auth.tsx` — Already polished; minor tweaks to match (already looks good)

**Entrepreneur dashboard pages** (wrapped in PageWrapper):
- `Dashboard.tsx` — Stat cards already have gradients; update quick action tiles to `card-spotify`, remove hard borders on sections
- `Products.tsx` — Product list cards to `card-spotify`, dialog to rounded-2xl
- `Orders.tsx` — Order cards borderless with subtle shadow, pill status badges
- `MyStore.tsx` — Settings cards to `card-spotify` style
- `Customers.tsx` — Customer cards to spotify style
- `Bookings.tsx` — Booking cards spotify style
- `Settings.tsx` — Settings sections rounded-2xl, borderless
- `Subscription.tsx` — Plan cards spotify style

**Customer pages:**
- `CustomerDashboard.tsx` — Stat cards, order cards spotify style

**Common approach for each page:**
- Replace `border` classes with `border-none shadow-md` or use `card-spotify`
- Replace `rounded-lg` with `rounded-2xl`
- Replace `hover:-translate-y-1` with `hover:scale-[1.02]`
- Add `transition-all duration-200` for smooth hover
- Use `pill-button` for filter tabs
- Use `glass-spotify` for floating/sticky elements

### Shared Component Updates:
- `WhySteerSolo.tsx` — Cards to spotify style
- `HowItWorks.tsx` — Step cards spotify style
- `SocialProofStats.tsx` — Stat items spotify style
- `HomepageReviews.tsx` — Review cards spotify style
- `FeaturedShopsBanner.tsx` — Cards spotify style
- `ShopperDiscovery.tsx` — Cards spotify style
- `Footer.tsx` — Subtle refresh (rounded elements, pill social links)

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/NigeriaDotMap.tsx` | **New** — Dotted Nigeria SVG |
| `src/components/ShareStorefront.tsx` | **New** — Share card modal |
| `src/components/StorefrontCustomizer.tsx` | **New** — Premium customization UI |
| `src/pages/Index.tsx` | Add Nigeria map, refresh card styles |
| `src/pages/ShopStorefront.tsx` | Add share button, apply custom theme vars |
| `src/pages/MyStore.tsx` | Add customizer section |
| `src/pages/Dashboard.tsx` | Spotify design refresh |
| `src/pages/Products.tsx` | Spotify design refresh |
| `src/pages/Orders.tsx` | Spotify design refresh |
| `src/pages/Customers.tsx` | Spotify design refresh |
| `src/pages/Bookings.tsx` | Spotify design refresh |
| `src/pages/Settings.tsx` | Spotify design refresh |
| `src/pages/Subscription.tsx` | Spotify design refresh |
| `src/pages/AboutPage.tsx` | Spotify design refresh |
| `src/pages/FAQ.tsx` | Spotify design refresh |
| `src/pages/Pricing.tsx` | Spotify design refresh |
| `src/pages/Auth.tsx` | Minor polish |
| `src/pages/customer/CustomerDashboard.tsx` | Spotify design refresh |
| `src/components/WhySteerSolo.tsx` | Spotify card styles |
| `src/components/HowItWorks.tsx` | Spotify card styles |
| `src/components/SocialProofStats.tsx` | Spotify card styles |
| `src/components/HomepageReviews.tsx` | Spotify card styles |
| `src/components/FeaturedShopsBanner.tsx` | Spotify card styles |
| `src/components/ShopperDiscovery.tsx` | Spotify card styles |
| `src/components/Footer.tsx` | Subtle refresh |

No database migrations needed — the `shops` table already has all required customization columns.

