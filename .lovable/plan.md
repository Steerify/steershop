

# Fix: Entrepreneur Button Redirecting to Customer Dashboard

## Problem

When a user clicks "Sign up with Google" on the signup tab (with "Entrepreneur/Sell" selected), they end up on the customer dashboard instead of being registered as an entrepreneur. This happens due to a **race condition** between two redirect mechanisms:

1. **GoogleSignInButton** checks `needs_role_selection` and tries to navigate to `/select-role`
2. **Auth.tsx useEffect** detects the user is now logged in and immediately redirects based on the current role (which defaults to `customer`)

The Auth.tsx redirect fires first and wins the race, sending the user to `/customer_dashboard`.

## Solution

### 1. Fix Auth.tsx redirect to check `needs_role_selection` (Primary Fix)

Before redirecting in the `useEffect`, check if the user's profile has `needs_role_selection = true`. If so, redirect to `/select-role` instead of the dashboard.

**File:** `src/pages/Auth.tsx` (lines 94-105)

```typescript
useEffect(() => {
  if (user && !authLoading) {
    // Check if this user needs role selection first (Google OAuth new signups)
    const checkRoleSelection = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('needs_role_selection')
        .eq('id', user.id)
        .single();
      
      if (profile?.needs_role_selection) {
        navigate('/select-role', { replace: true });
        return;
      }
      
      const defaultPath = getDashboardPath(user.role);
      const redirectPath = returnUrl || locationState?.from?.pathname || lastRoute || defaultPath;
      
      dispatch(clearSessionExpired());
      dispatch(setReturnUrl(null));
      dispatch(resetSession());
      
      navigate(redirectPath, { replace: true });
    };
    
    checkRoleSelection();
  }
}, [user, authLoading, navigate, returnUrl, lastRoute, locationState, dispatch]);
```

### 2. Fix ProtectedRoute to also check `needs_role_selection`

If a user somehow bypasses Auth.tsx and lands on a protected route while still needing role selection, the ProtectedRoute should catch this too.

**File:** `src/components/ProtectedRoute.tsx`

Add an async check: if the user's profile has `needs_role_selection = true`, redirect to `/select-role`.

### 3. Fix URL parameter handling in Auth.tsx

The route is `/auth/:type` but the component reads `searchParams.get("tab")` instead. This means navigating to `/auth/signup` shows the login tab. Fix it to also check the URL path parameter.

**File:** `src/pages/Auth.tsx` (line 57)

```typescript
// Use the URL path param (:type) as primary, query param as fallback
const { type } = useParams();
const defaultTab = type === 'signup' ? 'signup' : (searchParams.get("tab") || "login");
```

This requires adding `useParams` to the imports from `react-router-dom`.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Check `needs_role_selection` before redirecting; fix URL param handling |
| `src/components/ProtectedRoute.tsx` | Add `needs_role_selection` check as safety net |

## Why This Fixes It

- New Google users: Auth.tsx will detect `needs_role_selection = true` and send them to `/select-role` where they can pick Entrepreneur
- Existing users: The flag is `false`, so normal redirect logic applies
- URL fix: Going to `/auth/signup` will correctly show the signup tab with the role selector visible

