

# Plan: Video on Product Cards with Hover-to-Play

## Current State
- **Products.tsx (seller dashboard)**: Shows video only if no image exists; if both exist, shows image with a play icon that opens video in new tab
- **ShopStorefront.tsx (customer view)**: Shows video with autoPlay if `video_url` exists, otherwise falls back to image. No hover-to-play behavior.

Both pages currently autoplay videos constantly, which is wasteful and not the desired UX.

## Changes

### 1. `src/pages/ShopStorefront.tsx` — Hover-to-play on storefront product cards
- When a product has both `video_url` and `image_url`: show the image by default, on hover play the video (swap to `<video>` element)
- When a product has only `video_url`: show a poster frame (first frame via a paused video), play on hover
- Use `onMouseEnter` / `onMouseLeave` to control play/pause via refs
- Show a small play icon overlay when not hovering

### 2. `src/pages/Products.tsx` — Hover-to-play on seller product cards
- Same hover-to-play pattern: show image thumbnail by default, play video on hover
- If only video exists (no image), show paused video as thumbnail, play on hover
- Remove the current "open in new tab" play button behavior

### 3. Implementation approach
- Create a small reusable `ProductVideoCard` component (or inline the logic) that:
  - Renders a `<video>` element with `preload="metadata"` and `muted playsInline loop` but **not** `autoPlay`
  - On mouse enter: calls `videoRef.current.play()`
  - On mouse leave: pauses and resets to beginning
  - Overlays a play icon when paused
  - If an image exists, shows image as poster or as the default view with video hidden until hover

### No database or backend changes needed.

