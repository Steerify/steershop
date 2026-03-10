

# Plan: Shop Approval System (Pending → Admin Activates)

## Current State
- `shop.service.ts` creates shops with `is_active: true` — shops go live immediately
- Admin can already toggle `is_active` on/off in `AdminShops.tsx`
- The Explore page (`Shops.tsx`) already filters by `is_active: true` via `shopService.getShops`
- No visual distinction for pending/new shops in the admin panel

## Changes

### 1. `src/services/shop.service.ts` — New shops start inactive
- Change line 32: `is_active: true` → `is_active: false`
- This means all newly created shops require admin approval before appearing publicly

### 2. `src/pages/admin/AdminShops.tsx` — Add pending shops tab/filter + visual indicator
- Add a tab filter at the top: **All | Pending | Active | Inactive**
- Pending = `is_active === false` AND shop was created within the last 30 days (to distinguish new shops from deactivated ones). Alternatively, simply show all inactive shops with a "Pending" badge for shops that have never been activated (no products, recent creation).
- Add a **"Pending"** badge (orange/yellow) in the Status column for inactive shops created recently
- Add a prominent **"Approve"** button (green check icon) in the actions dropdown and as a direct action button for pending shops
- Show a count badge next to "Pending" tab so admin can see at a glance how many shops need approval

### 3. `src/pages/Dashboard.tsx` — Show "Pending Approval" banner to shop owner
- When the shop exists but `is_active === false`, show a card/banner telling the entrepreneur: "Your shop is pending approval. Our team will review and activate it shortly."
- This replaces or supplements the existing status badge so the owner knows their shop isn't broken, just awaiting review

### 4. `src/components/ShopStatusBadge.tsx` — Add 'pending' status
- Add a new status type `'pending'` alongside existing `'active' | 'trial' | 'expired' | 'free'`
- Render an orange/amber badge: "Pending Approval" with a Clock icon
- Show "Your store is under review" in the visibility indicator

### 5. `src/pages/MyStore.tsx` — Handle inactive shop gracefully
- When a shop owner views their store settings and the shop is inactive, show a notice that the shop is pending approval rather than allowing them to think something is wrong

### No database changes needed — `is_active` column already exists and RLS is already in place.

