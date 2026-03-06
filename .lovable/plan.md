

# Uniform Poppins Font Across the Storefront

## Changes

### 1. `src/index.css` (lines 134-160)
- Change `body` font-family from `'Roboto', 'Inter'` to `'Poppins', sans-serif`
- Change `h1-h6` font-family to just `'Poppins', sans-serif` (drop Playfair Display fallback)
- Remove `p, span, li` rule that forces Roboto/Inter — they'll inherit Poppins from body

### 2. `tailwind.config.ts` — font families
Update all font family definitions to use Poppins as the primary:
- `font-display`: `['Poppins', 'sans-serif']`
- `font-heading`: `['Poppins', 'sans-serif']`
- `font-sans`: `['Poppins', 'sans-serif']`
- `font-body`: `['Poppins', 'sans-serif']`

### 3. `index.html` — Google Fonts link (line 38)
Keep Poppins, remove Inter, Roboto, Playfair Display to reduce load:
```
family=Poppins:wght@400;500;600;700&display=swap
```

No component changes needed — all `font-display`, `font-heading`, `font-body` classes will resolve to Poppins automatically.

