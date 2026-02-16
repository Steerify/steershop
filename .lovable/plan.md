

# Comprehensive Upgrade: Location, Verification, and Explore Page Redesign

## Overview

This plan covers four major areas:
1. Fix shop location data flow (state/country missing from service layer)
2. Realistic verification logic that actually works for SMEs
3. Full Explore Shops page redesign with filters, sorting, and categories
4. Add product categories to the database for filtering

---

## 1. Fix Location Data in Shop Service

**Problem:** The `shop.service.ts` maps database fields to the `Shop` type but omits `state` and `country`. The Shops page uses `(shop as any).state` as a workaround.

**Changes:**

- **`src/types/api.ts`** -- Add `country?: string` to the `Shop` interface (state already exists)
- **`src/services/shop.service.ts`** -- Add `state: s.state` and `country: s.country` to ALL four mapping blocks (getShops, getShopByOwner, getShopBySlug, updateShop)
- **`src/pages/Shops.tsx`** -- Remove `(shop as any)` casts, use `shop.state` / `shop.country` directly

---

## 2. Fix Verification Logic (Realistic Thresholds)

**Current problem:** The `check_shop_verification` database function requires 40 completed orders per day for 30 days (1,200 orders/month) AND 4.0 rating. This is impossible for African SMEs.

**New criteria -- a shop is "Verified" when ALL of these are true:**
- Owner has bank verification completed (`bank_verified = true` in profiles)
- Shop has at least 10 completed orders total
- Shop has an average rating of 3.5 or higher (or no reviews yet, which is OK)
- Shop has been active for at least 7 days

**Changes:**

- **Database migration** -- Update the `check_shop_verification` function with realistic thresholds
- **Database migration** -- Create a trigger that re-checks verification when an order is completed or a review is added
- **`src/pages/Dashboard.tsx`** -- Add a "Verification Status" card that shows shop owners their progress toward verification (e.g., "Bank verified: Yes, Completed orders: 7/10, Rating: 4.2")
- **`src/pages/IdentityVerification.tsx`** -- Add a note explaining that bank verification contributes to the "Verified Business" badge

---

## 3. Add Product Categories

Products currently have no `category` column. We need this for filtering on the Explore page.

**Changes:**

- **Database migration** -- Add `category` column to `products` table with a default of `'general'`
- Predefined categories: Fashion, Electronics, Food & Drinks, Beauty & Health, Home & Living, Art & Craft, Services, Other
- **`src/pages/Products.tsx`** -- Add category dropdown when creating/editing a product
- **`src/services/product.service.ts`** -- Include category in product CRUD operations

---

## 4. Full Explore Shops Page Redesign

Transform `/shops` from a basic grid into an engaging marketplace experience.

**New layout structure:**

```text
+------------------------------------------+
| Navbar                                    |
+------------------------------------------+
| Hero: Search bar (centered, prominent)    |
| Subtitle + stats (X shops, Y products)   |
+------------------------------------------+
| Filter Bar (sticky on scroll):            |
| [All] [Fashion] [Food] [Beauty] [...]     |
| [Sort: Newest v] [Location v] [Verified]  |
+------------------------------------------+
| Trending / Featured Shops carousel        |
+------------------------------------------+
| Shop Grid (improved cards)                |
| - Larger logo                             |
| - Product preview thumbnails (3 mini)     |
| - Location badge                          |
| - Rating stars                            |
| - Verified badge                          |
| - Quick "Visit Shop" CTA                  |
+------------------------------------------+
| Product Results (when searching)          |
+------------------------------------------+
| Infinite scroll sentinel                  |
+------------------------------------------+
| Footer                                    |
+------------------------------------------+
```

**Specific changes to `src/pages/Shops.tsx`:**

- **Filter bar** -- Horizontal scrollable category chips (Fashion, Food, Beauty, etc.) below the search
- **Sort dropdown** -- Options: Newest, Highest Rated, Most Products, A-Z
- **State/Location filter** -- Dropdown with Nigerian states (Lagos, Abuja, Rivers, etc.) pulled from a utility
- **Verified toggle** -- Keep existing but style better inline with other filters
- **Improved shop cards:**
  - Show 2-3 product thumbnail previews below the shop logo (fetch top products per shop)
  - Larger, cleaner card design with more whitespace
  - Star rating displayed as actual stars (not just a number)
  - Location prominently displayed
  - Product count badge
- **Empty state** -- Better illustration and CTA for "No shops in this category"

**New files:**
- `src/components/ExploreFilters.tsx` -- Filter bar component (categories, sort, location, verified)
- `src/components/ShopCardEnhanced.tsx` -- Redesigned shop card with product previews

---

## 5. Shop Owner Verification Dashboard

Show shop owners their progress toward verification.

**Changes to `src/pages/Dashboard.tsx`:**
- Add a "Verification Progress" card in the overview section
- Checklist items:
  - Bank account verified (links to /identity-verification)
  - 10+ completed orders (shows current count)
  - 3.5+ average rating (shows current rating or "No reviews yet")
  - Account age 7+ days (shows join date)
- When all criteria are met, show a celebration state with the Verified badge

---

## Technical Summary

| File | Change |
|------|--------|
| **Database migration** | Update `check_shop_verification` function, add `category` to products, add verification trigger |
| `src/types/api.ts` | Add `country` to Shop interface |
| `src/services/shop.service.ts` | Add `state` and `country` to all 4 mapping blocks |
| `src/pages/Shops.tsx` | Full redesign with filters, sorting, categories, improved cards |
| `src/components/ExploreFilters.tsx` | New filter bar component |
| `src/components/ShopCardEnhanced.tsx` | New enhanced shop card with product previews |
| `src/pages/Products.tsx` | Add category selector when creating/editing products |
| `src/services/product.service.ts` | Include category field in CRUD |
| `src/pages/Dashboard.tsx` | Add Verification Progress card |
| `src/pages/IdentityVerification.tsx` | Add note about verification badge |

**Estimated scope:** This is a significant upgrade touching the database, service layer, and multiple UI components. The result will be a professional, world-standard marketplace experience.

