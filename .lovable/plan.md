

# Plan: Declutter Dashboard + Carousel Consistency + Mobile Pass

## 1. Move Standalone Sections into Carousel Slides

Currently cluttering the main layout:
- **`ProductNudges`** (line 699) — move into carousel as a compact slide
- **`DailySellerRoutine`** + **`StructuredSellingChallenge`** (lines 819-822) — convert the 30-Day Challenge into a carousel CTA slide ("Join the 30-Day Challenge → Start") that opens a dialog/sheet with the full challenge UI. Remove `DailySellerRoutine` as a standalone block and fold its nudge into the challenge slide.
- **Store Status** card (lines 971-993) — compact into a carousel slide showing visibility, subscription, products, rating in a 2x2 mini-grid
- **Help & Resources** card (lines 995-1015) — compact into a carousel slide with the 3 action buttons inline
- **Verification Progress** card (lines 824-827) — keep but make it collapsible (collapsed by default if > 3/5 criteria met)

**Remove from main layout:** `ProductNudges`, `DailySellerRoutine`, `StructuredSellingChallenge`, Store Status card, Help & Resources card.

**New dashboard flow:** Welcome Hero → Carousel (now 8-10 slides) → Stats → Quick Actions + Chart (left) | Profile Checklist + Wallet + Coupons (right)

## 2. Standardize Carousel Slide Heights

All slides get a consistent `min-h-[120px]` with content vertically centered via `flex items-center`. The carousel container itself gets `min-h-[120px]` to prevent layout shifts between slides.

## 3. Wallet Balance Verification

The payout service logic is correct — it queries `revenue_transactions` (Paystack payments only) minus completed/pending `shop_payouts`. No code fix needed. Wallet shows ₦0 when there are no Paystack-paid orders, which is accurate.

## 4. Mobile Adaptability

- Carousel already has swipe + hidden arrows — confirmed working
- Stat cards already use `grid-cols-2` on mobile — good
- Quick actions use `grid-cols-2` on mobile — good
- Right column stacks below via `lg:grid-cols-3` — good
- Minimal fixes: ensure new carousel slides don't overflow text on small screens

**Files:** `src/pages/Dashboard.tsx`

