

# Plan: Fix Video Upload & Playback

## Root Cause Analysis

After investigating the storage, database, RLS policies, and code:

1. **Storage is fine**: Files exist with correct MIME types (`video/mp4`) and reasonable sizes (16-44MB). Bucket is public with correct RLS.
2. **All products with `video_url` have `is_available: false`**: You've been deleting them because videos don't play — confirming the issue is persistent.
3. **The XHR upload is the likely culprit**: When `xhr.send(file)` is called, the browser may override or conflict with the manually set `Content-Type` header based on the File object's `.type` property. Some mobile-recorded videos have empty or incorrect `.type`, leading to files stored with wrong content types despite metadata looking correct. Additionally, XHR uploads can silently produce incomplete/corrupt files on slow connections without proper error detection.

## Changes

### 1. `src/components/VideoUpload.tsx` — Replace XHR with Supabase SDK upload

The Supabase SDK's `.upload()` method is battle-tested and handles content types, chunking, and error recovery reliably. We'll:

- **Remove the `uploadWithProgress` XHR function entirely**
- **Use `supabase.storage.from('product-videos').upload()`** with the correct `contentType` option and `upsert: true`
- **Simulate smooth progress** during upload (increment based on file size estimate) since SDK doesn't expose byte-level progress
- **Add post-upload validation**: After getting the public URL, create a hidden `<video>` element, attempt to load the video, and verify it fires `loadeddata` event before accepting it — if it fails, show an error asking the user to try a different video format
- **Add `onError` handler** to the preview `<video>` element to show "This video format may not be supported" instead of a gray player

### 2. `src/components/ProductMediaCard.tsx` — Graceful error fallback

- Add `onError` state to video elements — if the video fails to load, hide the video and show the image (or a placeholder icon) instead of a broken gray player
- This ensures product cards never show a broken video state on the storefront

### No database or backend changes needed.

