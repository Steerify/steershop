

# Fix Verification, Onboarding Redirect, Google Button Margins, and SEO Discoverability

## Issues Found

### 1. User Verification Not Working
The identity verification page (`/identity-verification`) exists and the KYC Level 2 (bank account) form works via the `verify-identity` edge function. However, there is no prominent pathway to reach it. Users don't know it exists. The verification flow itself (Paystack bank account resolve API) is functional -- it just needs better discoverability and a nudge after onboarding.

### 2. Onboarding Does Not Redirect to Dashboard (Critical Bug)
**Root cause:** In `AuthContext.tsx` (lines 90-97), `onboardingCompleted` is determined by whether the user **has a shop**. But after completing the onboarding survey, the user still has no shop. So:
- `onboardingCompleted = false` even after survey completion
- `ProtectedRoute` (line 63) keeps redirecting to `/onboarding`
- `/onboarding` shows the survey again (no check for existing responses)
- Result: infinite redirect loop

**Fix:** Change `onboardingCompleted` to check for **onboarding_responses** in the database, not just shops. Also add a check in `Onboarding.tsx` to skip to dashboard if responses already exist.

### 3. Google Login Button Margins
The `GoogleSignInButton` container has `minHeight` styling and the Auth page has spacing that creates unnecessary gaps around the Google button.

### 4. SEO / AI Discoverability for Shop Storefronts
Currently:
- The `shop-og-meta` edge function serves OG tags for social media crawlers only (via `vercel.json` rewrite matching User-Agent)
- Shop pages use client-side rendered JSON-LD (injected via `useEffect`) which Google **cannot read** because the SPA doesn't render for Googlebot
- No `sitemap.xml` exists
- `robots.txt` doesn't reference a sitemap

**Fix:** Create a dynamic `sitemap.xml` edge function that lists all active shops and products. Enhance the `shop-og-meta` function to also serve full SEO HTML (title, meta description, canonical, JSON-LD) for Googlebot. Add proper `robots.txt` with sitemap reference.

### 5. Build Error in `done-for-you-setup` Edge Function
The `var shopDescription` is declared multiple times with `var` causing a TypeScript error about subsequent variable declarations having different types.

---

## Changes

### File: `supabase/functions/done-for-you-setup/index.ts`
- Fix the `var` redeclaration build error by using `let` declarations at the top of the block and assigning in each branch

### File: `src/context/AuthContext.tsx`
- Change `onboardingCompleted` logic: check `onboarding_responses` table instead of `shops` table
- An entrepreneur has completed onboarding if they have at least 1 row in `onboarding_responses`

### File: `src/pages/entrepreneur/Onboarding.tsx`
- Add a check on mount: if user already has `onboarding_responses`, redirect to `/dashboard` immediately (prevents re-showing survey)

### File: `src/components/ProtectedRoute.tsx`
- No changes needed (logic is correct, just depends on `onboardingCompleted` being accurate)

### File: `src/pages/Auth.tsx` (Google button margins)
- Remove extra spacing/margins around the GoogleSignInButton in both login and signup tabs
- Reduce the `minHeight` in GoogleSignInButton container

### File: `src/components/auth/GoogleSignInButton.tsx`
- Remove unnecessary `minHeight` style and simplify the container CSS to eliminate extra margins

### File: `src/pages/Settings.tsx` or `src/pages/Dashboard.tsx`
- Add a visible "Verify Your Identity" card/link nudging users toward `/identity-verification` when `bank_verified` is false

### File: `supabase/functions/generate-sitemap/index.ts` (New)
- New edge function that generates a dynamic `sitemap.xml`
- Queries all active shops and their products from the database
- Outputs XML sitemap with `<url>` entries for each shop (`/shop/{slug}`) and product page
- Includes `lastmod`, `changefreq`, and `priority` attributes

### File: `supabase/functions/shop-og-meta/index.ts`
- Extend to detect Googlebot (not just social crawlers) via User-Agent
- Add full SEO meta tags: `<meta name="description">`, `<link rel="canonical">`, JSON-LD structured data (LocalBusiness schema with products) directly in the HTML
- This ensures Google indexes shop pages with proper metadata

### File: `public/robots.txt`
- Add `Sitemap: https://steersolo.lovable.app/sitemap.xml` directive

### File: `vercel.json`
- Add Googlebot to the User-Agent matching pattern for the `/shop/:slug` rewrite
- Add a rewrite rule for `/sitemap.xml` pointing to the `generate-sitemap` edge function
- Add `/s/:slug` short URL pattern for Googlebot as well

### File: `supabase/config.toml`
- Register the new `generate-sitemap` function

---

## Technical Details

### Onboarding Redirect Fix (AuthContext)

```text
// Before (broken):
onboardingCompleted = (shops && shops.length > 0)

// After (correct):
const { data: onboardingData } = await supabase
  .from('onboarding_responses')
  .select('id')
  .eq('user_id', supabaseUser.id)
  .limit(1);
onboardingCompleted = (onboardingData && onboardingData.length > 0);
```

### Onboarding.tsx Guard

At the top of the component, before showing the survey:
```text
// Check if already completed onboarding
useEffect(() => {
  if (user?.id && hasCheckedAccess) {
    supabase.from('onboarding_responses')
      .select('id').eq('user_id', user.id).limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Already completed, redirect to dashboard
          navigate('/dashboard', { replace: true });
        }
      });
  }
}, [user, hasCheckedAccess]);
```

### Dynamic Sitemap Edge Function

```text
GET /sitemap.xml ->
  Query all active shops from shops table
  Query all available products
  Generate XML:
    - Homepage: https://steersolo.lovable.app/
    - Each shop: https://steersolo.lovable.app/shop/{slug}
    - Each product: https://steersolo.lovable.app/shop/{slug}/product/{product_id}
    - Static pages: /about, /pricing, /faq, /how-it-works
  Return with Content-Type: application/xml
```

### Shop OG Meta Enhancement for Google

The edge function will detect Googlebot alongside social crawlers and serve enriched HTML with:
- Standard meta description tag
- Canonical URL
- JSON-LD LocalBusiness schema embedded in HTML (not client-side JS)
- Product listing schema for shops with products

### Verification Nudge

On the Dashboard, when `bank_verified === false`, show a small card:
- "Get verified to receive payouts and earn the Verified Seller badge"
- Links to `/identity-verification`
- Dismissible (localStorage)

### done-for-you-setup Build Fix

Replace the multiple `var` declarations with a single `let` declaration pattern:
```text
let shopDescription: string;
let shopSlug: string;

if (!aiResponse.ok) {
  shopDescription = `Welcome to ${business_name}!...`;
  shopSlug = business_name.toLowerCase()...;
} else {
  // ... assign from AI result
}
```

