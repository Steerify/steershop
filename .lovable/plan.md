
# Fix Multiple Issues: Empty Profile, Entrepreneur Routing, Shop Location, Homepage Link

## Issues Identified

### 1. Empty Profile After Manual Email Signup (Screenshot: "Welcome back, !")
The `handle_new_user()` trigger reads `full_name` from `raw_user_meta_data`, but during simplified signup (Auth.tsx), firstName and lastName are sent as empty strings. The trigger stores `null` for `full_name`, causing "Welcome back, !" on the dashboard.

**Fix:** Update Dashboard.tsx to gracefully handle missing names -- show email-based greeting instead. Also update the `handle_new_user` trigger to fall back to email prefix when full_name is empty.

### 2. Entrepreneur Role Redirects to Customer Dashboard Instead of Onboarding Survey
The issue is in Auth.tsx line 110: after login, `getDashboardPath(user.role)` returns `/dashboard` for entrepreneurs. But this goes straight to the Dashboard -- it never checks whether onboarding was completed. New entrepreneurs who haven't created a shop should be redirected to `/onboarding` first.

**Fix:** In Auth.tsx, after login, check `user.onboardingCompleted`. If the user is an ENTREPRENEUR and `onboardingCompleted === false`, redirect to `/onboarding` instead of `/dashboard`. The `onboardingCompleted` field already exists in AuthContext (checks if user has a shop).

### 3. Add Logistics Question to Onboarding Survey
**Fix:** Add a 5th required question to the onboarding survey in Onboarding.tsx asking about delivery/logistics preferences: "Do you handle delivery yourself?", "I use a logistics company", "I need delivery help", "Pickup only".

### 4. Shop Location (Country + State) and Location Search
The `shops` table currently has no `country` or `state` columns.

**Fix:**
- Add `country` and `state` columns to the shops table via migration (default country to 'Nigeria')
- Update MyStore.tsx shop creation/edit form to include state selection
- Update Shops.tsx search to filter by location
- Update shop.service.ts to support location fields

### 5. Direct Link to "For Shoppers" Section
The homepage already has a sellers/shoppers toggle (Tabs component). Adding `id="for-shoppers"` to the section and providing a link `/#for-shoppers` in the Navbar will allow direct navigation.

**Fix:** Add an `id` to the shoppers section, add a "For Shoppers" link in the Navbar, and auto-switch the tab when the hash is present.

---

## Technical Details

### Database Migration
```text
ALTER TABLE public.shops ADD COLUMN country text DEFAULT 'Nigeria';
ALTER TABLE public.shops ADD COLUMN state text;
```

### File Changes

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Redirect new entrepreneurs to `/onboarding` instead of `/dashboard` |
| `src/pages/Dashboard.tsx` | Handle empty name gracefully (show email prefix) |
| `src/pages/entrepreneur/Onboarding.tsx` | Add logistics/delivery question as Q5 |
| `src/services/onboarding.service.ts` | Add `deliveryMethod` field to OnboardingData |
| `src/pages/MyStore.tsx` | Add state dropdown to shop creation/edit form |
| `src/services/shop.service.ts` | Include country/state in shop creation |
| `src/pages/Shops.tsx` | Add location filter dropdown + search by state |
| `src/pages/Index.tsx` | Add `id="for-shoppers"` and hash-based auto-switch |
| `src/components/Navbar.tsx` | Add "For Shoppers" nav link pointing to `/#for-shoppers` |
| Database migration | Add `country` and `state` columns to shops table |
| `supabase/functions/handle_new_user` | Update trigger to fallback to email prefix for full_name |

### Onboarding New Question
```text
Q5: "How do you handle delivery?"
Options: 
- "I deliver myself"
- "I use a logistics company (e.g., GIG, DHL)"
- "I need help with delivery"  
- "Customers pick up from me"
```

Also update the `onboarding_responses` table to add a `delivery_method` column.

### Location Search in Shops Page
Add a state dropdown filter alongside the existing search bar. Nigerian states will be a hardcoded list (36 states + FCT). When selected, shops are filtered by state.

### Entrepreneur Redirect Fix (Auth.tsx)
```text
// In getDashboardPath or the redirect logic:
if (user.role === UserRole.ENTREPRENEUR && !user.onboardingCompleted) {
  return "/onboarding";
}
```

This also needs to be applied in the ProtectedRoute for `/dashboard` -- if user hasn't completed onboarding, redirect to `/onboarding`.
