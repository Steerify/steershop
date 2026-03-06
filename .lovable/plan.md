
The user wants to replace the Nigeria map component with a global dot-matrix map image and make the background transparent.

## Plan: Replace Nigeria Map with Global Dot-Matrix Map

### Step 1: Asset Management
- Copy the uploaded globe image to `src/assets/global-dot-map.png`

### Step 2: Update Component
- Rename or update `src/components/NigeriaDotMap.tsx` to use the new global map image
- Update the import statement to use the new asset path
- Update the alt text to reflect it's a global map
- Keep all animation logic intact (300ms delay, 1000ms fade-in)

### Step 3: Make Background Transparent
- Add `bg-transparent` class to the wrapper div
- Ensure the image has transparent background by using `mix-blend-mode` or keeping `object-contain` which will preserve transparency

The component structure remains the same — only the image asset and alt text change. No changes needed to Index.tsx or usage locations.
