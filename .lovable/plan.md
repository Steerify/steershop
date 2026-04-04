

# Sprint 3: Vendor Invite & Onboarding Polish + Fix All Images

## Scope

Two parallel tracks:
1. **Sprint 3 features**: Vendor invite link generator, invite script templates, beauty-specific DFY polish
2. **Image fixes**: Replace all Unsplash photos with Nigerian vendor/beauty-specific images, fix any broken URLs

---

## Track 1: Vendor Invite System

### New file: `src/pages/entrepreneur/VendorInvite.tsx`
A dashboard page where existing vendors can generate and share personalized invite links. Features:
- Auto-generates invite URL using existing referral code system (`referralService.getReferralCode()`)
- Pre-written WhatsApp invite scripts (from the Domination Plan Appendix A) — copy-to-clipboard
- 3 invite script variants: "Personal invite", "Success story", "Business opportunity"
- Share via WhatsApp button with pre-filled message
- Stats: how many vendors invited, how many signed up

### Edit: `src/App.tsx`
- Add route `/vendor-invite` (protected, shop_owner only)

### Edit: `src/components/AdminSidebar.tsx` or Dashboard
- Add "Invite Vendors" link in the entrepreneur sidebar/dashboard

### Edit: `src/pages/Dashboard.tsx`
- Add a "Grow the Community" card linking to `/vendor-invite` with invite count

---

## Track 2: Fix All Images — Nigerian Vendor Photos

### Problem
The homepage uses generic Unsplash photos that don't depict Nigerian vendors. Several may be broken (404). The images need to show:
- African/Nigerian women entrepreneurs
- Beauty products (skincare, makeup)
- Mobile commerce / phone usage
- Market/vendor scenes

### Edit: `src/pages/Index.tsx` — Replace the `P` object
Replace all 12 photo URLs with verified, working Unsplash photos depicting Nigerian/African vendors and beauty commerce:

| Key | Current (generic) | Replacement (Nigerian-relevant) |
|---|---|---|
| `heroVendor` | Generic photo | African woman entrepreneur with phone/products |
| `heroProducts` | Generic beauty products | Nigerian beauty/skincare products close-up |
| `organic` | Generic organic | Natural/organic African beauty ingredients |
| `trustFace` | Non-African face | Nigerian woman's confident portrait |
| `orders` | Generic packages | Product packaging/shipping in African context |
| `storefront` | Generic storefront | African business owner with phone |
| `whatsapp` | Generic commerce | Mobile phone/WhatsApp commerce scene |
| `instagram` | Generic social | Social media content creation |
| `tiktok` | Generic TikTok | Content creator filming |
| `av1`, `av2`, `av3` | Non-African avatars | African women portrait thumbnails |

All URLs will be verified working Unsplash photos with Nigerian/African subjects.

### Edit: `src/pages/DemoStoreFront.tsx`
- Replace the demo store owner avatar and product images with African fashion/beauty-relevant photos

### Edit: `src/components/ReferralCard.tsx` — Brand color fix
- Replace remaining `yellow-500` and `yellow-700` references with `accent` (light green) brand colors
- Replace gold gradient on Crown icon with green gradient

---

## Files Summary

**New:**
- `src/pages/entrepreneur/VendorInvite.tsx` — Invite page with scripts & sharing

**Edited:**
- `src/pages/Index.tsx` — All 12+ photo URLs replaced with Nigerian vendor imagery
- `src/pages/DemoStoreFront.tsx` — Demo store images updated
- `src/components/ReferralCard.tsx` — Yellow → brand green
- `src/App.tsx` — Add `/vendor-invite` route
- `src/pages/Dashboard.tsx` — Add invite vendors card

## No database changes needed
Invite system reuses existing `referral_codes` and `referrals` tables.

