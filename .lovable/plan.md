

# Plan: Replace Nigeria SVG Map with Uploaded Image

Replace the programmatic SVG dot-matrix map with the user's uploaded image of Nigeria.

## Steps

1. **Copy image** to `src/assets/nigeria-dot-map.png`
2. **Rewrite `src/components/NigeriaDotMap.tsx`** — replace the entire SVG implementation with a simple `<img>` tag importing the asset, keeping the fade-in animation wrapper

