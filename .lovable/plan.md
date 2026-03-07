

# Plan: Real Percentage Progress for Video Upload

## Problem
Currently progress uses fixed steps (5% → 10% → 30% → 80% → 100%) that don't reflect actual compression or upload progress.

## Changes

### `src/components/VideoUpload.tsx`

**1. Compression phase (0–50%) — real-time progress via `timeupdate`**
- Add an `onProgress` callback parameter to `compressVideo`
- Inside, listen to the video's `timeupdate` event and calculate `currentTime / duration` to report real compression progress
- Map this to 0–50% of the total progress bar

**2. Upload phase (50–95%) — use XMLHttpRequest for real upload tracking**
- Replace `supabase.storage.upload()` with a direct `XMLHttpRequest` to the Supabase Storage REST API (`/storage/v1/object/product-videos/${filePath}`)
- Use `xhr.upload.onprogress` to get `loaded / total` bytes and map to 50–95%
- Use the auth session token for the `Authorization` header

**3. Finalization (95–100%)**
- After upload completes, get public URL and set to 100%

**4. Status text updates**
- During compression: `Compressing... X%`
- During upload: `Uploading... X%`

### No other files change

