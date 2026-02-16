

# Homepage Enhancement + Shop Location Display + Shopper Section

## Summary

The homepage currently targets only sellers. We'll add a subtle but compelling section for shoppers/visitors, show business locations on shop cards, and keep everything professional without overcrowding the page.

## Changes

### 1. Show Business Location on Shop Cards (Shops Page + Storefront)

**`src/pages/Shops.tsx`**
- In the shop card grid (line ~503-516), add the shop's `state` and `country` below the shop name or description
- Display as a subtle `MapPin` icon + location text (e.g., "Lagos, Nigeria" or "Port Harcourt, Nigeria")
- The `shops` table already has `state` and `country` columns -- just need to display them

**`src/pages/ShopStorefront.tsx`**
- In the shop header card (line ~370-384), add location display next to the shop name/description area
- Query already fetches `*` from shops, so `state` and `country` are available
- Add a `MapPin` icon with location text

**`src/components/FeaturedShopsBanner.tsx`**
- Add location to featured shop cards (need to include `state`, `country` in the shops join query)
- Show as small text below the tagline

### 2. Add a Shopper/Visitor Section on Homepage

**`src/pages/Index.tsx`**
- Add a new section between Featured Shops and WhySteerSolo (after Section 2, before Section 3)
- Title: "Shop from Trusted Nigerian Businesses"
- Subtitle: "Discover verified sellers, browse products, and buy with confidence"
- Three interactive cards:
  - "Browse Shops" -- links to /shops with a Store icon and product count stat
  - "Secure Checkout" -- highlights safe payments with Shield icon  
  - "Track Orders" -- highlights order tracking with Package icon
- A CTA button: "Explore Shops" linking to /shops
- This section is clean, compact (not overwhelming), and gives visitors a reason to explore as buyers

### 3. Add a Subtle "Why Create a Store?" Nudge

**`src/pages/Index.tsx`**
- In the existing WhySteerSolo section area, add a short comparison banner before the final CTA:
  - A compact "See what sellers are building" strip that links to /shops
  - Shows 2-3 real stats if available (e.g., "X active stores", "Y products listed") pulled from a simple count query
- This gives visitors social proof without being pushy

### 4. Homepage Section Order (Updated)

1. Hero (TypewriterEffect -- already working on mobile)
2. Featured Shops Banner (existing)
3. **NEW: Shopper Discovery Section** -- "Shop from Trusted Businesses"
4. WhySteerSolo (existing -- targets sellers)
5. HowItWorks (existing)
6. Pricing (existing)
7. Reviews (existing)
8. Final CTA (existing)

## Technical Details

### Files Modified

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Add ShopperDiscovery section between FeaturedShopsBanner and WhySteerSolo |
| `src/components/ShopperDiscovery.tsx` | **New file** -- interactive shopper-facing section with browse/checkout/track cards and live stats |
| `src/pages/Shops.tsx` | Add MapPin + location display to shop cards |
| `src/pages/ShopStorefront.tsx` | Add MapPin + location display in shop header |
| `src/components/FeaturedShopsBanner.tsx` | Include state/country in query, show location on featured cards |

### New Component: `ShopperDiscovery.tsx`

- Fetches live counts from Supabase: active shops count and total products count
- Displays three interactive cards with hover effects
- "Explore Shops" CTA links to /shops
- Compact design -- no more than ~300px vertical space on mobile
- Uses existing design system (Card, Badge, Button components)

### Location Display Pattern

```
MapPin icon (14px) + "Lagos, Nigeria" (text-xs text-muted-foreground)
```

- Falls back to just country if state is null
- Shows nothing if both are null (graceful degradation)

