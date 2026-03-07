

# Plan: Add Storefront Stats + Dark Mode Logo Swap

## 1. Add "Completed Orders" and "Total Ratings" stats to Shop Storefront header

In `src/pages/ShopStorefront.tsx`:

- **Fetch completed orders count** in `loadShopData()` — query `orders` table with `.eq('shop_id', shopData.id).eq('status', 'completed')` using `count: 'exact'` (head-only query).
- **Store in state** as `completedOrders` (number).
- **Display in the stats row** (around line 571) alongside existing rating/product badges:
  - **Completed Orders**: ShoppingCart icon + count, styled as a pill badge (matching existing style)
  - **Total Ratings**: Star icon + `shop.total_reviews` count (currently shows rating value; add a dedicated "Total Ratings" badge with just the count)

## 2. Dark mode logo swap

- **Copy** the uploaded dark logo (`user-uploads://Steersolo.jpeg`) to `src/assets/steersolo-logo-dark.jpg`
- **Update `src/components/Navbar.tsx`**:
  - Import the dark logo
  - Use `useTheme()` (already imported) to conditionally render: dark theme → dark logo, light theme → light logo
  - Only applies when not showing `shopBranding` (i.e., on SteerSolo-branded pages)
  - Remove `bg-white` from the logo container div when in dark mode so the dark logo's black background looks natural

- **Update all other components** that import `steersolo-logo.jpg` and display it visually (Navbar, Footer, AdminSidebar, CustomerSidebar, PageLoadingSkeleton, Dashboard pages, etc.) — same pattern: import both logos, pick based on theme.

**Key files to update for dark logo:**
- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`
- `src/components/AdminSidebar.tsx`
- `src/components/CustomerSidebar.tsx`
- `src/components/PageLoadingSkeleton.tsx`
- Other pages that import the logo (Dashboard, Orders, MyStore, etc.)

