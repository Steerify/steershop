

# Plan: Image Optimization, Workflow Audit, and AI UX Tester

## 1. Convert Hero Map Image to AVIF

**Problem**: The `global-dot-map.png` in `NigeriaDotMap.tsx` is loaded eagerly on the homepage hero section, impacting LCP (Largest Contentful Paint).

**Approach**: Since Lovable cannot convert image files directly, we will:
- Use the `<picture>` element with AVIF/WebP sources and PNG fallback
- Install `vite-plugin-image-optimizer` to auto-generate optimized formats at build time
- Alternatively (simpler): update `NigeriaDotMap.tsx` to add `fetchpriority="high"`, `decoding="async"`, and proper sizing attributes for performance, while you manually upload an `.avif` version of the image

**Recommended approach**: Add a Vite image optimization plugin that auto-converts PNG/JPG to AVIF/WebP at build time. This handles all images across the app, not just this one.

**Files changed**: `vite.config.ts`, `src/components/NigeriaDotMap.tsx`

---

## 2. Workflow Issues Identified

After reviewing the codebase, here are issues that could hurt user adoption and retention:

### Critical Issues
1. **Auth route pattern mismatch**: Routes use `/auth/:type` (e.g., `/auth/signup`) but CTA buttons link to `/auth/signup` which works, however the `defaultTab` logic falls back to `searchParams.get("tab")` which is fragile -- if someone visits `/auth` without a type param, `type` is undefined and defaults to login tab, which is fine, but the route itself won't match `/auth/:type` and will 404.

2. **No `AuthProvider` wrapping check**: `AuthProvider` is in `main.tsx` but `BrowserRouter` is inside `App.tsx`. This means `useAuth` works everywhere, but `useNavigate` doesn't work inside `AuthProvider` (which is fine currently since it doesn't navigate).

3. **ProtectedRoute makes 2 DB calls per navigation**: It fetches the profile AND checks onboarding on every route change. This is redundant with `AuthContext` which already fetches the same data. This causes unnecessary latency on every page navigation for logged-in users.

4. **`AfricaGlobe` component is unused**: It's defined but never imported anywhere. Dead code.

5. **`Math.random()` in render**: `AfricaGlobe` uses `Math.random()` for particle positions, causing layout shifts on every re-render. Should use `useMemo`.

### UX / Adoption Issues
6. **No loading state on Google sign-in button**: Users may click multiple times.
7. **Empty firstName/lastName on signup**: Signup sends empty strings for name fields, meaning the profile will have no name until onboarding. If a customer signs up (not entrepreneur), there's no onboarding flow to collect this data.
8. **Customer role has limited value**: Customer dashboard, orders, courses, rewards, and wishlist pages exist but the value proposition is unclear -- customers may sign up and find nothing useful.
9. **`hero-image.jpg`, `nigeria-dot-map.png`, `pattern-bg.jpg`**: These assets exist but appear unused -- dead weight in the bundle.

---

## 3. AI UX Audit Tool

**What**: Build an admin-only page that uses AI to analyze the app's routes, components, and user flows, generating a UX audit report.

**Approach**:
- Create a backend function (`ai-ux-audit`) that takes a list of routes/features and uses Lovable AI to analyze potential UX issues
- Create an admin page `/admin/ux-audit` that triggers the audit and displays findings
- The AI will analyze: route accessibility, component complexity, missing error states, dead features, onboarding gaps

**Files to create**:
- `supabase/functions/ai-ux-audit/index.ts` -- edge function calling Lovable AI
- `src/pages/admin/AdminUXAudit.tsx` -- admin page to view results
- Add route in `App.tsx`

**However** -- this is a substantial feature. I'd recommend we first address the concrete issues from #2, then build the AI audit tool as a follow-up.

---

## Recommended Implementation Order

1. Fix the image optimization (AVIF + performance attributes)
2. Fix ProtectedRoute double-fetching (use AuthContext data instead)
3. Remove dead code (`AfricaGlobe`, unused assets)
4. Fix customer signup flow (collect name for customers)
5. Build AI UX audit tool (follow-up)

