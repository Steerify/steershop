

# Plan: Fix Routing Race Conditions

## Problems Identified

**Problem 1: New entrepreneur routed to customer dashboard**
- After signup + email verification + login, `AuthContext.fetchUserProfile` runs. Due to a race condition with the database trigger (`handle_new_user`), the profile may not be ready yet, defaulting the role to `CUSTOMER`.
- Even when the profile IS ready, the `Auth.tsx` useEffect (line 123) fires before `fetchUserProfile` completes its async work, using a stale `user` object.

**Problem 2: Onboarding loop (phone verification → survey → back to phone verification)**
- After completing the survey, `handleSubmit` navigates to `/dashboard`.
- `ProtectedRoute` checks `user.onboardingCompleted` which is **stale** (still `false` in the AuthContext because `fetchUserProfile` hasn't re-run).
- ProtectedRoute redirects back to `/onboarding`.
- Onboarding detects `onboarding_responses` exists and redirects to `/dashboard`.
- This creates an infinite redirect loop.

## Root Cause
**AuthContext never refreshes `user` after profile changes.** There is no `refreshUser()` function. Once the user object is set, role and onboardingCompleted are frozen until a page refresh.

## Changes

### 1. `src/context/AuthContext.tsx` — Add `refreshUser` function
- Expose a `refreshUser()` method on the AuthContext that re-calls `fetchUserProfile` and updates the `user` state.
- This lets any component force a fresh profile read after making database changes.

### 2. `src/context/AuthContext.tsx` — Add retry logic to `fetchUserProfile`
- When the profile query returns no data (trigger hasn't completed yet), wait 1 second and retry once. This handles the race condition on fresh signups.

### 3. `src/pages/entrepreneur/Onboarding.tsx` — Call `refreshUser` after saving onboarding
- In `handleSubmit` (line 191) and `handleSkipQuestions` (line 171): call `refreshUser()` before navigating. This ensures `ProtectedRoute` sees the updated `onboardingCompleted = true`.

### 4. `src/pages/auth/RoleSelection.tsx` — Call `refreshUser` after setting role
- After updating the profile role (line 75-87), call `refreshUser()` so the AuthContext has the correct role before navigating to `/onboarding`.

### 5. `src/components/ProtectedRoute.tsx` — Use database role as source of truth
- The current ProtectedRoute already fetches `needs_role_selection` from the database. Extend this to also fetch `role` directly from the database instead of relying on the potentially stale `user.role` from AuthContext. This eliminates the "wrong dashboard" redirect on first load.

### 6. `src/pages/entrepreneur/Onboarding.tsx` — Fix redirect loop for completed onboarding
- Line 88-89: Currently redirects to `/dashboard` hardcoded. Should redirect based on role (shop_owner → dashboard, customer → customer_dashboard) to avoid role mismatch redirects.

## No database or backend changes needed.

