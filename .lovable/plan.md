
# Navigation & Store Status Fixes

## Issues Identified

### Issue 1: Blank Pages During Navigation
After thorough analysis, I found three primary causes for the blank page/stop behavior when navigating:

| Cause | Location | Impact |
|-------|----------|--------|
| **No QueryClient caching** | `src/App.tsx:76` | Data refetches on every navigation, causing loading delays |
| **Auth state race condition** | `src/context/AuthContext.tsx:122-129` | Profile fetch runs async with `setTimeout(0)`, can delay user state |
| **Suspense without prefetching** | `src/App.tsx:93` | Lazy-loaded pages show skeleton until chunk downloads |

### Issue 2: Store Status Rendering
The database already has proper RLS policies that filter shops based on subscription status:

```text
RLS Policy: "Anyone can view active shops with subscriptions"
Function: shop_has_valid_subscription(id)
  - Checks is_active = true
  - Checks owner's subscription_expires_at > now()
  - Works for both trial and paid subscriptions
```

**Current Status**: Shop visibility is correctly enforced at the database level. However, the **Dashboard** and **My Store** pages don't display the shop's subscription status prominently enough for shop owners.

---

## Solution

### Part 1: Fix Navigation/Blank Page Issues

**1.1 Add React Query caching configuration**

Update `src/App.tsx` to configure `staleTime` and `gcTime`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000,  // Cache retained for 10 minutes
      refetchOnWindowFocus: false, // Prevent refetch on tab focus
      retry: 1, // Only retry once on failure
    },
  },
});
```

**1.2 Eager load frequently accessed pages**

Currently only `Index`, `Auth`, `Callback`, and `NotFound` are eager loaded. Add these commonly accessed pages:

```typescript
// Eager load critical pages
import Dashboard from "./pages/Dashboard";
import MyStore from "./pages/MyStore";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Shops from "./pages/Shops";
```

**1.3 Improve AuthContext loading state**

Modify `src/context/AuthContext.tsx` to prevent flash during profile fetch by setting `isLoading` only after the full profile is ready.

---

### Part 2: Add Shop Status Display

**2.1 Create a `ShopStatusBadge` component**

New component at `src/components/ShopStatusBadge.tsx` that displays:
- Active (Subscribed) - Green badge
- Trial (X days remaining) - Yellow/amber badge  
- Expired - Red badge with "Upgrade" CTA

**2.2 Integrate into Dashboard**

Update `src/pages/Dashboard.tsx` to show the status badge prominently in the header area, showing:
- Current subscription status (trial/active/expired)
- Days remaining
- Quick action to upgrade if trial/expired

**2.3 Integrate into MyStore**

Update `src/pages/MyStore.tsx` to show store visibility status:
- "Your store is visible to customers" (when active/trial)
- "Your store is hidden - subscription expired" (when expired)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Configure QueryClient with caching; eager load more pages |
| `src/context/AuthContext.tsx` | Improve loading state management |
| `src/components/ShopStatusBadge.tsx` | **NEW** - Reusable status badge component |
| `src/pages/Dashboard.tsx` | Add ShopStatusBadge to header |
| `src/pages/MyStore.tsx` | Add store visibility status indicator |

---

## Technical Implementation

### QueryClient Configuration (App.tsx)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### ShopStatusBadge Component

```typescript
interface ShopStatusBadgeProps {
  status: 'active' | 'trial' | 'expired';
  daysRemaining: number;
  showUpgradeAction?: boolean;
}

export const ShopStatusBadge = ({ 
  status, 
  daysRemaining, 
  showUpgradeAction = true 
}: ShopStatusBadgeProps) => {
  // Renders appropriate badge based on status
  // Shows "X days left" for trial
  // Shows "Upgrade" button for expired
};
```

### Eager Loading Pattern

Move frequently accessed pages from lazy to eager loading to prevent chunk download delays during navigation.

---

## Expected Outcomes

| Issue | Before | After |
|-------|--------|-------|
| Navigation delay | Blank screen while fetching | Cached data shows instantly |
| Page chunk loading | Skeleton shown every time | Common pages pre-loaded |
| Shop status visibility | Hidden in profile data | Prominent badge in Dashboard/MyStore |
| Expired shop awareness | Owner may not know | Clear "Store Hidden" warning |

---

## Database Verification

The database is correctly configured:
- RLS policy `shop_has_valid_subscription()` properly filters shops
- Function checks both trial and paid subscription status
- Shops with expired owners are automatically hidden from public view

No database changes are needed - only frontend improvements for better UX.
