

# Plan: Fix Image Reset & Prevent DFY Popup Data Loss

## Two Issues

### Issue 1: Image preview doesn't clear after adding a product
The `ImageUpload` component has its own internal `previewUrl` state. When the parent clears `productPreviewUrl` after adding a product, the `ImageUpload` component doesn't react because its internal `previewUrl` isn't synced with the parent's `value` prop.

**Fix in `src/components/ImageUpload.tsx`:**
- Add a `useEffect` that watches the `value` prop — when `value` becomes empty/falsy and there's no upload in progress, clear the internal `previewUrl` state. This ensures the component resets when the parent clears it.

### Issue 2: DFY popup resets and loses all user input
The Dashboard's `loadData()` function runs on mount and re-runs when data changes. Every time it detects "no shop", it calls `setShowDfyPopup(true)` — but if the dialog was already open and the component re-renders (e.g., due to route change, auth state change, or `loadData` re-firing), React unmounts and remounts the `DoneForYouPopup`, wiping all state (business name, WhatsApp, draft products).

**Fix in `src/components/DoneForYouPopup.tsx`:**
- Don't reset form state when dialog opens. Only reset on successful completion or explicit dismissal.
- Add a `useEffect` that only resets state when transitioning from `open=false` to `open=true` **and** the step is already "complete" (i.e., a previous flow finished). Otherwise, preserve all entered data.

**Fix in `src/pages/Dashboard.tsx`:**
- Guard the `setShowDfyPopup(true)` call so it only fires once (e.g., using a ref or checking if already open), preventing re-triggering that could cause remounts.

### Files to Change
1. **`src/components/ImageUpload.tsx`** — Add `useEffect` to sync internal preview with `value` prop
2. **`src/components/DoneForYouPopup.tsx`** — Only reset form state on completion/dismiss, not on every open
3. **`src/pages/Dashboard.tsx`** — Guard DFY popup trigger to prevent re-firing

