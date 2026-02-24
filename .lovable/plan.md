

# Fix Authentication, Workflows, and Business Plan Branding

## Issues Found

### 1. Auth Route Mismatch (Login/Signup Broken)

The Auth page route is defined as `/auth/:type` (e.g., `/auth/login`, `/auth/signup`), but multiple places in the codebase redirect to `/auth?tab=login` (without the `:type` param). This URL does NOT match any route and falls through to the 404 page.

**Broken redirects found in:**
- `src/pages/auth/Callback.tsx` -- 3 instances of `navigate("/auth?tab=login")`
- `src/pages/auth/RoleSelection.tsx` -- 2 instances
- `src/pages/ResetPassword.tsx` -- 3 instances

**Fix:** Change all `navigate("/auth?tab=login")` to `navigate("/auth/login")` in these files.

### 2. Content-Security-Policy Blocking Auth Calls

The `index.html` has a strict CSP that may block Supabase auth and Google Sign-In flows:
- `script-src` only allows `self` and `accounts.google.com` -- inline scripts from Google Identity Services may be blocked
- `connect-src` doesn't include `wss://` for Supabase realtime or some Google auth endpoints

**Fix:** Update CSP to be more permissive for auth flows:
- Add `'unsafe-inline'` to `script-src` (required for Google Identity Services inline callbacks)
- Add Google auth API endpoints to `connect-src`
- Add `blob:` to `img-src` for uploaded images

### 3. Business Plan Shop Branding (Custom Name and Logo)

Business plan shop owners should have their business name and logo displayed instead of the SteerSolo branding on their storefront. This requires:

**Changes to `src/pages/ShopStorefront.tsx`:**
- Fetch the shop owner's subscription plan
- If on Business plan, display the shop's logo and name in the storefront header instead of SteerSolo branding
- Hide "Powered by SteerSolo" badge or make it subtle for Business plan shops

**Changes to `src/components/Navbar.tsx`:**
- When viewing a Business plan shop's storefront, show the shop's logo and name instead of SteerSolo in the navbar

### 4. Business Plan Shops Fully Visible Online (Search/Discovery)

The Shops browse page (`/shops`) already supports search by name, description, and slug. To make Business plan shops more prominent and searchable:

**Changes to `src/pages/Shops.tsx`:**
- Add a "Featured" or "Premium" badge for Business plan shops
- Prioritize Business plan shops in search results (sort them higher)
- Add keyword/tag search capability

**Database query enhancement:**
- Join shops with profiles and subscription_plans to identify Business plan shops
- Add a visual indicator (crown/star badge) for Business plan shops in listings

---

## Technical Summary

| Priority | File | Change |
|----------|------|--------|
| Critical | `src/pages/auth/Callback.tsx` | Fix 3 broken redirects: `/auth?tab=login` to `/auth/login` |
| Critical | `src/pages/auth/RoleSelection.tsx` | Fix 2 broken redirects |
| Critical | `src/pages/ResetPassword.tsx` | Fix 3 broken redirects |
| Critical | `index.html` | Relax CSP to allow Google Identity Services and Supabase auth |
| High | `src/pages/ShopStorefront.tsx` | Show shop's own brand (logo + name) for Business plan shops |
| High | `src/pages/Shops.tsx` | Add premium badge and priority sorting for Business plan shops |
| Medium | `src/components/Navbar.tsx` | Show shop branding instead of SteerSolo when on Business plan shop storefront |

