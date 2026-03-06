

# Plan: Spotify-Inspired Shop Design Refresh

## Design Philosophy (Spotify Web Traits)
- **Cards**: Larger border-radius (1rem+), no visible borders, background elevation via subtle shadows, hover = gentle scale-up + brighter shadow
- **Image-forward**: Product/shop images take center stage, overlaid with gradients for text readability
- **Colors**: Leverage existing dark mode well; in light mode use soft muted backgrounds with pops of accent color
- **Typography**: Clean, generous spacing, bold headings, muted secondary text
- **Animations**: Smooth scale transitions on hover (1.02-1.04x), no jarring movement
- **Layout**: Generous padding, breathing room between elements, full-bleed hero sections

## Files to Modify

### 1. `src/components/ShopCardEnhanced.tsx` — Spotify-style shop card
- Remove visible card borders, use `bg-card` with soft shadow
- Larger border-radius (`rounded-2xl`)
- On hover: `scale-[1.02]` + elevated shadow, no translate-y
- Shop logo gets a subtle ring/glow instead of gradient box
- Product preview thumbnails: fully rounded corners, slight gap increase
- "Visit →" becomes a subtle pill button on hover reveal
- Overall: more padding, cleaner spacing

### 2. `src/pages/Shops.tsx` — Spotify-style browse page
- Hero section: Replace pattern background with a smooth gradient (like Spotify's genre/mood headers)
- Search bar: Rounded-full, frosted glass effect, no visible border until focus
- Grid: Increase gap, cards breathe more
- Section headers: Bolder, left-aligned (Spotify doesn't center section titles)
- Skeleton cards match new card style
- Filter tabs: Pill-shaped, Spotify-style toggle buttons

### 3. `src/pages/ShopStorefront.tsx` — Spotify-style storefront
- Shop header card: Remove `card-african` style, use full-width gradient backdrop derived from accent colors, glass-card overlay
- Product grid cards: Image-dominant (larger aspect ratio), rounded-2xl, border-none, shadow-based elevation
- Hover effect: Scale + shadow, eye icon overlay fades in smoothly
- Floating cart bar: More rounded, pill-shaped buttons, frosted glass
- Filter tabs: Pill-shaped like Spotify's "All / Music / Podcasts" toggle

### 4. `src/index.css` — Add Spotify-inspired utility classes
- `.card-spotify`: rounded-2xl, no border, shadow-md, hover:shadow-xl hover:scale-[1.02] transition
- `.glass-spotify`: backdrop-blur-xl with higher opacity
- `.pill-button`: rounded-full small button style
- Subtle gradient overlay utilities

## No Content Changes
All text, features, data, buttons, links, and functionality remain exactly the same. Only visual styling (classes, shadows, border-radius, hover effects, spacing) changes.

