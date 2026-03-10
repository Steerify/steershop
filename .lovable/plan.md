

# Plan: Auto-Categorize Shops & Wire Up Category Filters

## Current State
- **Products** have a `category` column (values: `general`, `food-drinks`, etc.) but 103 out of 105 are set to `general` (the default).
- **Shops** have NO `category` column — so the category filter chips in the Explore page do nothing.
- The `selectedCategory` state exists in `Shops.tsx` but is never used to filter the shop list.

## Approach: Derive Shop Category from Products

Instead of adding a `category` column to shops (which would require manual input from every seller), we'll **auto-derive each shop's category from its products' categories**. When filtering by category, we filter shops that have at least one product in that category.

Since most products are currently `general`, we'll also add a **keyword-based auto-categorization** that runs client-side on the product/shop name and description to assign a display category. This gives immediate visual categorization without requiring sellers to re-tag their products.

## Changes

### 1. Add keyword-based auto-categorizer utility
**New file: `src/utils/autoCategorize.ts`**
- Export a function `autoCategorize(name: string, description: string): string` that scans text for keywords and returns a category slug (`fashion`, `electronics`, `food-drinks`, `beauty-health`, `home-living`, `art-craft`, `services`, `other`).
- Keyword map examples: "shoe", "dress", "cloth", "bag" → `fashion`; "phone", "laptop", "gadget" → `electronics`; "fish", "food", "snack", "cake" → `food-drinks`; etc.
- Falls back to `other` if no keywords match.

### 2. Wire up category filtering in `Shops.tsx`
- After fetching shops + their product previews, compute each shop's **display category** using `autoCategorize(shop.name, shop.description)`.
- When `selectedCategory !== 'all'`, filter `sortedShops` to only show shops whose display category matches.
- Show category badge on each shop card.

### 3. Update `ShopCardEnhanced.tsx`
- Accept optional `displayCategory` prop.
- Show a small category badge (e.g., "Fashion", "Food & Drinks") below the shop description so users can see what each shop sells at a glance.

### 4. Update `ExploreFilters.tsx`
- Add shop counts per category next to each chip label (e.g., "Fashion (3)") so users know how many shops are in each category.
- Accept optional `categoryCounts` prop.

### 5. No database changes needed
The auto-categorization runs entirely client-side using existing shop/product names and descriptions.

## Technical Detail: Keyword Map

```text
fashion    → shoe, sneaker, dress, cloth, wear, bag, cap, fashion, style, apparel, fabric, aso, ankara
electronics → phone, laptop, gadget, tech, computer, charger, electronic, cable, earphone, speaker
food-drinks → food, fish, cake, snack, drink, rice, chicken, shawarma, grill, fruit, juice, water
beauty-health → beauty, skin, hair, cream, makeup, cosmetic, perfume, spa, health, soap, lotion
home-living → furniture, decor, pillow, curtain, bed, kitchen, home, interior, rug, towel
art-craft → art, craft, paint, drawing, bead, handmade, crochet, pottery, sculpture
services → service, consult, repair, clean, delivery, tutorial, training, compliance, hub, digital
```

Matching is case-insensitive against `shop_name + description`. First match wins.

