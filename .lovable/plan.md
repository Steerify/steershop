

# Plan: Trial Shops Visible, Free Plan Shops Hidden + Free Plan Restrictions Banner

## Overview

- **Trial users**: shops remain visible in marketplace and via direct link until trial expires
- **Free plan users**: shops are hidden from marketplace AND direct storefront access. When a free user visits their own storefront or dashboard, they see a persuasive banner explaining what they can't do and encouraging upgrade

## Changes

### 1. ShopStorefront.tsx — Block free-plan shops from public viewing

In `loadShopData()` (around line 292), after fetching the owner's profile data, calculate subscription status using `calculateSubscriptionStatus`. If the owner is on the `free` plan and the visitor is NOT the owner, show a "Shop Unavailable" message instead of the storefront, with a message like "This shop is currently on a free plan and not visible to the public."

If the visitor IS the owner, show the storefront but with a persistent banner at the top explaining:
- "Your shop is hidden from the public"
- List of restricted features (no AI tools, no verification badge, limited to 5 products, shop not visible in marketplace)
- CTA button to upgrade

### 2. Shops.tsx (Marketplace) — Filter out free-plan shops

In `fetchShops()` (around line 186), after fetching shops, also fetch owner profiles to determine subscription status. Filter out shops whose owners are on the `free` plan (expired trial, not subscribed, and no active subscription). This keeps trial and paid shops visible.

Approach: Query profiles for all shop owner_ids, calculate status for each, and exclude `free` status shops from the displayed list.

### 3. Create a reusable `FreeShopRestrictionsBanner` component

A dismissible (per session) banner component showing:
- "Your shop is not visible to customers"
- List: No marketplace listing, no AI tools, no verified badge, max 5 products
- "Upgrade Now" button linking to `/pricing`

Used in both Dashboard and ShopStorefront for free-plan owners.

### 4. Dashboard.tsx — Show restrictions banner for free users

Add the `FreeShopRestrictionsBanner` component to the dashboard when `subscriptionStatus === 'free'`, placed prominently near the top.

## Technical Details

- `calculateSubscriptionStatus` from `src/utils/subscription.ts` already returns `'free'` status — reuse this
- The storefront already fetches owner profile data (lines 292-319) — extend with subscription status check
- For marketplace filtering, batch-fetch profiles for displayed shop owner_ids to avoid N+1 queries
- The "shop unavailable" page for public visitors will be a simple card with SteerSolo branding, not a 404

