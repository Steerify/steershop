

# Fix Featured Shops Card Alignment

The cards are different sizes because the description text varies in length (line-clamp-2 allows 1 or 2 lines), and there's no fixed height on the card. The first card's logo also sits at the left edge while others are centered.

## Changes — `src/components/FeaturedShopsBanner.tsx`

1. **Set a fixed height on the card** so all cards are uniform regardless of content length:
   - Add `h-[160px]` to the card `div` (line 176-181) to enforce consistent height

2. **Fix the description to always occupy the same space** by changing `line-clamp-2 mb-2` to `line-clamp-2 min-h-[2.5rem]` so 1-line descriptions still reserve 2-line space

3. **Vertically center the content row** — change `items-start` to `items-center` on the flex container (line 196) so logo and text align nicely

4. **Uniform card widths** — ensure `w-[340px]` on all breakpoints (remove the `w-[300px] sm:w-[340px]` split on line 174), use a single `w-[340px]` for consistency

These 4 small tweaks will make every card the same height and layout regardless of content length.

