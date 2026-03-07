

# Plan: Fix Video Playback Issues

## Root Cause
The XHR upload in `VideoUpload.tsx` sends the video blob **without a `Content-Type` header**. This means the storage backend doesn't know the file's MIME type and may serve it with a generic content type (e.g., `application/octet-stream`), which browsers refuse to play as video.

## Changes

### `src/components/VideoUpload.tsx`

**1. Add `Content-Type` header to XHR upload**
- In `uploadWithProgress`, set `xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')` so the storage knows the MIME type
- This ensures browsers can play the video when loaded via the public URL

**2. Add `preload="auto"` to the preview video element**
- The preview `<video>` element (line 269-276) currently has no `preload` attribute — add `preload="auto"` so the browser fetches enough data to display and play the video immediately after upload

**3. Ensure correct blob type on fallback uploads**
- When compression fails and the original file is uploaded, the blob already has the correct `.type` from the `File` object
- When compression succeeds, the WebM blob already has `type: 'video/webm'`
- Both cases will now be handled correctly by the `Content-Type` header

### `src/components/ProductMediaCard.tsx`
- Add `preload="auto"` to both video elements (hover video in image+video case, and video-only case) to ensure enough data is loaded for immediate playback on hover

### No database or backend changes needed
The video files are already correctly stored in the public bucket. The fix is purely about how they're uploaded (MIME type) and loaded (preload).

