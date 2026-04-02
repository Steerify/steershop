

# Plan: Homepage Redesign — Corrected Brand Colors

## Brand Colors (Confirmed)
- **Dark Blue** (Adire Indigo): `hsl(215, 65%, 25%)` — `--primary`
- **Light Green** (Nigerian Green): `hsl(145, 60%, 38%)` — `--accent`
- **White / Black** — foregrounds and backgrounds depending on theme
- **NO yellow/gold** in any prominent visual role. Gold stays ONLY for star ratings (semantic use).

## What's Wrong Now

The homepage uses `GOLD = "hsl(42,90%,55%)"` in **18+ places**: hero headline emphasis, eyebrow text, trust pills, ticker strip background, demo store button, stat numbers, SafeBeauty section headers, badge labels, testimonial stars/borders, CTA headline, and background glow effects. This is not on-brand.

## Changes

### `src/pages/Index.tsx` — Full color correction

**Remove:** `GOLD` constant from all visual uses. Replace every instance:

| Current (Gold) | Replacement |
|---|---|
| Hero eyebrow border + text | White with 60% opacity |
| Hero headline emphasis `color: GOLD` | `hsl(145, 60%, 48%)` (light green, brightened for dark bg) |
| Demo store button `background: GOLD` | White bg, dark blue text |
| Trust pills `background/color: GOLD` | White/15% bg, white text |
| Ticker strip `background: GOLD` | `--accent` (light green) bg, white text |
| Stat numbers `color: GOLD` | White |
| Reality stats eyebrow + numbers | Light green |
| Reality stats CTA button | Light green bg, dark text |
| SafeBeauty eyebrow + heading emphasis | Light green |
| Badge labels `color: GOLD` | White |
| Top badge gradient | Light green gradient (not gold) |
| Testimonial stars | Light green fill |
| Testimonial avatar border | White border |
| Vendor stories eyebrow | Light green |
| Final CTA headline emphasis | Light green |
| Final CTA demo button | White outline button |
| Background gold glows | Green glows or remove |

**Also fix:**
- Remove `--gold-gradient` and `--shadow-gold` references from hero/CTA glow effects
- Broken hero images: verify Unsplash URLs load, replace any that 404

### `src/index.css` — Minor cleanup
- Keep `--gold` variable for star ratings only
- Remove `--gold-gradient` from prominent use
- Remove `--shadow-gold`

### `src/components/ProductRating.tsx`
- Change `fill-yellow-400 text-yellow-400` → `fill-gold text-gold` (semantic, stars only)

### `src/components/TestimonialCard.tsx`
- Change `text-gold fill-gold` stars — keep as-is (stars are acceptable gold use)

### `src/pages/BrandPage.tsx`
- Update `BRAND_COLORS` array: remove Gold/Amber as a primary brand color, demote to "Semantic only — star ratings"
- Update brand story to reflect light green + dark blue + white/black as the 3 brand colors

## Files to Edit
1. `src/pages/Index.tsx` — Replace all 18+ gold usages with green/white/blue
2. `src/index.css` — Remove gold from gradients/shadows
3. `src/components/ProductRating.tsx` — Yellow → gold CSS var
4. `src/pages/BrandPage.tsx` — Update brand color documentation

## No database changes needed

