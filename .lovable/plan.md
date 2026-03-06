

# Fixes: Enterprise Pricing, Font Consistency & Contrast

## 1. Enterprise Pricing — What It Is

The "Enterprise pricing" link at the bottom of the pricing section (line 287-292 in `DynamicPricing.tsx`) is a WhatsApp contact link for the hidden **Business plan** (the "Ghost Plan" strategy). It's not a real plan shown on the grid — it exists as a psychological anchor. The link says "Contact us for Enterprise pricing →" and opens WhatsApp to discuss the Business plan.

**No code change needed** — this is working as designed. It's your hidden high-tier plan that makes Pro look more affordable by comparison.

---

## 2. Poppins Font on Storefront

The `ShopStorefront.tsx` (line 474-475) allows shop owners to override the font via `font_style`. When no custom font is set, the storefront inherits Poppins from the global CSS (which we already fixed). This is working correctly — Poppins is the default everywhere.

**No change needed** — Poppins is already the global default after the previous fix.

---

## 3. Contrast Issues in Dark Mode

The screenshot shows poor text contrast — the body text and sub-headings are barely visible against the dark background. The issue is in the dark mode CSS variables in `src/index.css`:

### Changes to `src/index.css` (dark mode variables, around lines 72-100):

- **`--foreground`**: Brighten from `40 20% 98%` — this is fine, but `--muted-foreground` is too dim
- **`--muted-foreground`**: Change from `40 15% 65%` → `40 15% 75%` (brighter muted text for readability)
- **`--secondary-foreground`**: Already `40 20% 98%` — fine
- **`--card`**: Change from `220 35% 12%` → `220 35% 14%` (slightly lighter cards for more separation from background)
- **`--border`**: Change from `220 30% 20%` → `220 30% 24%` (more visible borders)

### Changes to `src/pages/Index.tsx` (hero section, lines 70-84):

- Line 70: The `h1` heading uses `text-foreground` by default which is fine, but the body text on line 83 uses `text-muted-foreground` which is too dim in dark mode. The CSS fix above addresses this globally.
- Line 74: `text-foreground/90` — change to `text-foreground` for full opacity in the sub-heading.

### Summary of CSS variable changes in dark mode block:

| Variable | Before | After | Reason |
|---|---|---|---|
| `--muted-foreground` | `40 15% 65%` | `40 15% 75%` | Body text too dim |
| `--card` | `220 35% 12%` | `220 35% 14%` | Better card/bg separation |
| `--border` | `220 30% 20%` | `220 30% 24%` | More visible borders |
| `--input` | `220 30% 20%` | `220 30% 24%` | Match border |

### In `Index.tsx` line 74:
- Change `text-foreground/90` → `text-foreground` for the sub-heading

These are small but impactful tweaks that improve readability across all dark-mode pages without changing the overall aesthetic.

