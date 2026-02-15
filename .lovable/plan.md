# Remove Images, Move Featured Shops to Hero Area

## Changes

Remove the two image sections from the Index page and move the Featured Shops banner up to replace them.

### What gets removed:

1. **"Nigerian Business Showcase" image grid** (lines 179-204) -- the 4 Unsplash photos with "Real businesses. Real results."
2. **"Built for businesses like yours" banner** (lines 285-300) -- the wide photo with text overlay

### What moves:

- **FeaturedShopsBanner** currently sits at line 312 (after SocialProofStats and ShopAvatars). It will move up to where the image showcase was -- right after the Hero section and before WhySteerSolo.

### Resulting page order:

1. Hero (audience toggle, headline, CTA)
2. **Featured Shops** (moved here)
3. WhySteerSolo
4. Value Proposition
5. How It Works
6. Social Proof Stats
7. Shop Avatars (real user logos)
8. Pricing / Discovery CTA
9. Reviews
10. Final CTA

### File Modified

- `src/pages/Index.tsx` -- remove two image sections, move `<FeaturedShopsBanner />` up