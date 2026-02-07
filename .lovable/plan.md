
# Add Auth-Style Background Patterns to Strategic Pages

## What the Auth Page Has
The Auth page uses three decorative background elements:
1. `AdirePattern variant="geometric"` at `opacity-5` covering the full page
2. A top-right gradient blur circle (`w-64 h-64`, primary color)
3. A bottom-left gradient blur circle (`w-64 h-64`, accent color)

These create a subtle, polished feel that's currently missing from 14 pages.

## Strategy: Maximum Coverage with Minimum Changes

Instead of editing all 14 pages individually, the smartest approach is:

1. **AdminLayout.tsx** -- Add the pattern + blur circles to the shared layout wrapper. This instantly covers **all 12 admin pages** with a single edit.
2. **ResetPassword.tsx** -- Add the same treatment as the Auth page (same auth flow, should match visually).
3. **auth/Callback.tsx** -- Add a subtle pattern to the loading/redirect screen for visual consistency.

That's **3 file edits** covering **14 pages**.

---

## Changes

### 1. AdminLayout.tsx
Add to the `<main>` wrapper area:
- `AdirePattern variant="dots"` with `opacity-5` as a background layer (using "dots" to differentiate from auth's "geometric" -- admin feels more structured)
- Top-right and bottom-left gradient blur circles
- Add `relative overflow-hidden` to the main container so patterns stay contained

### 2. ResetPassword.tsx
Mirror the Auth page treatment exactly:
- Add `AdirePattern variant="geometric"` with `opacity-5`
- Add the two gradient blur circles (top-right primary, bottom-left accent)
- Add `relative overflow-hidden` to the outer container
- Add `relative z-10` to the Card so it stays above the pattern

### 3. auth/Callback.tsx
- Add `AdirePattern variant="geometric"` with `opacity-5` as background
- Add the two gradient blur circles
- Keeps visual continuity during the auth redirect flow

---

## Technical Details

The pattern added to each page follows this structure:
```text
<div className="... relative overflow-hidden">
  <AdirePattern variant="geometric" className="absolute inset-0 opacity-5" />
  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl" />
  
  {/* existing content with relative z-10 */}
</div>
```

### Files to Modify

| File | Pages Covered | Pattern Variant |
|------|--------------|-----------------|
| `src/components/AdminLayout.tsx` | All 12 admin pages | `dots` |
| `src/pages/ResetPassword.tsx` | Reset password | `geometric` |
| `src/pages/auth/Callback.tsx` | Auth callback/redirect | `geometric` |
