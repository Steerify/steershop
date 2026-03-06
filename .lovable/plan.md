

# Plan: Replace Nigeria Dot Map with Accurate, Dense Dot-Matrix Version

The current map uses a crude bounding-box approximation that produces a vaguely rectangular blob — nothing like the reference image showing a proper Nigeria silhouette filled with dense green dots and labeled cities.

## Approach

**Replace `src/components/NigeriaDotMap.tsx`** entirely with a high-fidelity implementation:

### Accurate Nigeria Boundary
- Define ~80-100 polygon vertices tracing Nigeria's actual border (including the southern coastline indentation around the Niger Delta, the northeastern Lake Chad region, the western border bulge near Lagos/Ogun)
- Use a proper **ray-casting point-in-polygon** algorithm instead of the current bounding-box hack

### Dense Dot Grid
- Reduce dot spacing from 8px to ~5px for a denser fill matching the reference image
- Use uniform small circles (`r={2}`) with solid green fill (`fill-primary` or `fill-[#0A7B3E]`)
- No separate "outline dots" — just the filled grid clipped to the polygon (like the reference)

### City Labels
- Add more cities to match reference: **Lagos, Abuja, Kano, Kaduna, Port Harcourt, Ibadan, Enugu, Benin City, Maiduguri, Ilorin**
- City markers: small white/lighter dot with uppercase bold label text positioned beside it
- Keep the subtle pulse animation on city dots

### Styling
- Dots use a rich green (`#0A7B3E` / `hsl(var(--primary))`) — solid, not transparent like current
- Dark mode: slightly brighter green
- Remove the dashed connection lines (not in reference)
- Clean, no-frills look matching the reference's professional cartographic style

### No changes to `Index.tsx`
The component is already imported and positioned correctly in the hero. Only the component internals change.

## File

| File | Change |
|------|--------|
| `src/components/NigeriaDotMap.tsx` | Full rewrite with accurate polygon + dense dots |

