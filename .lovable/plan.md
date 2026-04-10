

# Plan: Fix Build Errors + Feature Phase System + Marketplace Enhancements

## Part 1: Fix Build Errors (process-email-queue)

The TypeScript errors are caused by the Supabase client's strict typing not recognizing the `email_send_log` table columns and `move_to_dlq` RPC function parameters. 

**Fix**: Add explicit type casting (`as any`) to the Supabase client in `process-email-queue/index.ts` for:
- All `.from('email_send_log').insert(...)` calls (lines 63, 271, 298, 335)
- The `.rpc('move_to_dlq', ...)` call (line 70)
- Add explicit types to `.map((msg: any)` (line 159) and `.filter((id: any)` (line 164)

**File**: `supabase/functions/process-email-queue/index.ts`

---

## Part 2: Admin Feature Phase Toggle System

Create a system where admin can activate/deactivate feature phases from the dashboard. Uses the existing `platform_settings` table.

### Database: Insert feature phase settings
Insert 4 rows into `platform_settings` using the insert tool:
- `feature_phase_1` → `{"enabled": true, "label": "Core Store"}` (MVP — always on)
- `feature_phase_2` → `{"enabled": true, "label": "Marketplace Discovery"}`
- `feature_phase_3` → `{"enabled": false, "label": "Trust & Payments"}`
- `feature_phase_4` → `{"enabled": false, "label": "Domination Engine"}`

### New: `src/hooks/useFeaturePhases.ts`
Hook that reads `platform_settings` for `feature_phase_*` keys and returns which phases are enabled. Caches in memory. Used by components to conditionally render features.

### New: `src/pages/admin/AdminFeaturePhases.tsx`
Admin page with 4 toggle cards (one per phase), each showing:
- Phase name and description
- List of features included
- Toggle switch to enable/disable
- Visual indicator (locked/unlocked)

Phase definitions:
- **Phase 1 (Core)**: Store creation, product upload, store link, WhatsApp order button
- **Phase 2 (Discovery)**: Marketplace browsing, categories, featured vendors, search
- **Phase 3 (Trust)**: Verified vendors, reviews/ratings, Paystack payments
- **Phase 4 (Domination)**: Vendor analytics, paid promotions, recommendation system

### Edit: `src/App.tsx`
Add route `/admin/feature-phases`

### Edit: `src/components/AdminSidebar.tsx`
Add "Feature Phases" link

### Edit: `src/pages/Shops.tsx`
Wrap trending products section and advanced filters behind phase 2 check. Wrap reviews/verified badge behind phase 3 check.

---

## Part 3: Marketplace Enhancements

### Edit: `src/pages/Shops.tsx` — Price filter
Add min/max price filter inputs to the filter bar. Filter products by price range.

### Edit: `src/pages/Shops.tsx` — Trending stores section
Add a "Trending Stores" row at the top (based on recent order count or view count), showing top 5 shops in a horizontal scroll.

### Edit: `src/pages/Shops.tsx` — Product cards with visible prices
Ensure every product card shows price prominently, store name, and "Order on WhatsApp" button.

### Edit: `src/components/ExploreFilters.tsx`
Add price range filter (min/max inputs) to the filter bar.

---

## Part 4: Security Audit Quick Fixes

- Run the Supabase linter to check for RLS issues
- Verify all sensitive tables have proper RLS
- Ensure no client-side admin checks

---

## Files Summary

**New:**
- `src/hooks/useFeaturePhases.ts` — Feature phase hook
- `src/pages/admin/AdminFeaturePhases.tsx` — Admin toggle page

**Edited:**
- `supabase/functions/process-email-queue/index.ts` — Fix type errors
- `src/App.tsx` — Add admin route
- `src/components/AdminSidebar.tsx` — Add sidebar link
- `src/pages/Shops.tsx` — Trending stores, price filters
- `src/components/ExploreFilters.tsx` — Price range filter

**Database:**
- Insert 4 feature phase rows into `platform_settings` table

