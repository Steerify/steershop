
# Ambassador Program -- Full Implementation Plan

## Overview
Transform the existing basic referral system (which only awards points) into a tiered Ambassador Program with real, tangible rewards that drive viral growth. Every user gets a referral link. Reaching milestones unlocks escalating rewards.

## Current State
- Referral codes exist (`referral_codes` table) -- every user can generate one (format: `SS-XXXXXX`)
- Referrals are tracked (`referrals` table) with `status: pending | rewarded`
- Points are awarded via a database trigger (`process_referral_reward`) when a referred user's first order is paid (50 pts to referrer, 25 to referred)
- `ReferralCard` component shows code + stats on the dashboard
- Admin can view all referrals at `/admin/referrals`
- `featured_shops` table already exists for featuring shops on the homepage

## What's Missing
- No concept of ambassador **tiers** or **milestone rewards**
- No mechanism to grant a free subscription month
- No mechanism to auto-feature a shop as a reward
- No "reseller status" concept
- The referral card only shows points -- no progress toward milestones
- No dedicated ambassador page showing the full program

---

## Implementation

### 1. Database: Ambassador Tiers Table

Create an `ambassador_tiers` table to track which milestones a user has reached and when rewards were claimed.

```text
ambassador_tiers
  id              uuid    PK DEFAULT gen_random_uuid()
  user_id         uuid    NOT NULL (references auth.users)
  tier            text    NOT NULL ('bronze' | 'silver' | 'gold')
  reached_at      timestamptz  NOT NULL DEFAULT now()
  reward_claimed  boolean DEFAULT false
  claimed_at      timestamptz NULL
  created_at      timestamptz DEFAULT now()
  UNIQUE(user_id, tier)
```

RLS Policies:
- Users can SELECT their own tiers (`auth.uid() = user_id`)
- System/edge function inserts via service role (no direct user INSERT needed)
- Admins can SELECT all (using `has_role()`)

### 2. Edge Function: `check-ambassador-tier`

A backend function that checks a user's qualified referral count and awards tier rewards. Called after each referral is rewarded (can be triggered from the existing `process_referral_reward` trigger via `pg_net`, or called from the frontend after loading referral stats).

Logic:
- Count referrals where `referrer_id = user_id AND status = 'rewarded'`
- **10 referrals (Bronze):** Grant 30 days free subscription
  - Update `profiles.subscription_expires_at` to extend by 30 days
  - Update `profiles.is_subscribed` to true if not already
  - Insert into `subscription_history` with `event_type: 'ambassador_reward'`
  - Insert into `ambassador_tiers` with `tier: 'bronze'`
- **50 referrals (Silver):** Feature their shop for 30 days
  - Insert into `featured_shops` table with `is_active: true`, `expires_at: now() + 30 days`
  - Insert into `ambassador_tiers` with `tier: 'silver'`
- **100 referrals (Gold):** Grant "Reseller" status
  - Insert into `ambassador_tiers` with `tier: 'gold'`
  - Add a `is_reseller` boolean column to `profiles` table, set to `true`
  - Reseller status gives a permanent badge and could unlock future wholesale/commission features

The function is idempotent -- if a tier is already reached, it skips it.

### 3. Database Migration

```text
-- Ambassador tiers table
CREATE TABLE public.ambassador_tiers (...)

-- Add reseller flag to profiles
ALTER TABLE public.profiles ADD COLUMN is_reseller boolean DEFAULT false;

-- RLS policies for ambassador_tiers
-- Users can view own, admins can view all
```

### 4. Updated `ReferralCard` Component

Replace the current simple stats card with a full Ambassador Program card:

- Keep existing: referral code, copy/share buttons, WhatsApp share
- Add: **Milestone Progress Tracker** showing 3 tiers as a visual progress bar
  - Bronze (10 referrals): "Free month of SteerSolo"
  - Silver (50 referrals): "Your shop featured on homepage"
  - Gold (100 referrals): "Reseller status unlocked"
- Each tier shows: icon, reward description, progress (e.g., "7/10"), and a checkmark if achieved
- Show a "Claim Reward" button for reached-but-unclaimed tiers
- The share link uses the full URL: `steersolo.lovable.app/auth/signup?ref=SS-XXXXXX`

### 5. Dedicated Ambassador Page

Create `src/pages/Ambassador.tsx` -- a full page accessible from dashboard and navbar:

- Hero section: "SteerSolo Ambassador Program" with the value proposition
- The 3 tiers displayed as cards with clear rewards
- User's current progress and referral list
- Shareable referral link with copy + WhatsApp + native share
- Leaderboard showing top 5 referrers (anonymized, e.g., "S***a -- 23 referrals")
- Add route `/ambassador` to App.tsx

### 6. Referral Service Updates

Update `src/services/referral.service.ts`:
- Add `getAmbassadorTiers()` -- fetch user's reached tiers from `ambassador_tiers`
- Add `claimAmbassadorReward(tier)` -- call the `check-ambassador-tier` edge function
- Add `getLeaderboard()` -- fetch top referrers (count of rewarded referrals, grouped by referrer_id)

### 7. Dashboard Integration

Update `src/pages/Dashboard.tsx`:
- Add "Ambassador" to QuickActions grid (icon: Crown, color: gold)
- If user has unclaimed ambassador rewards, show a notification badge

### 8. Admin Enhancements

Update `src/pages/admin/AdminReferrals.tsx`:
- Add an "Ambassadors" tab showing users who have reached tiers
- Show tier, reward status (claimed/unclaimed), referral count

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/check-ambassador-tier/index.ts` | Evaluate and award tier rewards |
| `src/pages/Ambassador.tsx` | Full ambassador program page |

### Files to Modify
| File | Change |
|------|--------|
| `src/components/ReferralCard.tsx` | Add milestone progress tracker with 3 tiers |
| `src/services/referral.service.ts` | Add ambassador tier methods + leaderboard |
| `src/pages/Dashboard.tsx` | Add Ambassador to QuickActions |
| `src/pages/admin/AdminReferrals.tsx` | Add Ambassadors tab |
| `src/App.tsx` | Add `/ambassador` route |
| `supabase/config.toml` | Add `check-ambassador-tier` function config |

### Database Migration
- Create `ambassador_tiers` table with RLS
- Add `is_reseller` column to `profiles`

### Edge Function: `check-ambassador-tier`
- Accepts: `user_id` (from auth token)
- Uses service role to update profiles, featured_shops, ambassador_tiers
- Returns: `{ tiers_reached: string[], rewards_granted: string[] }`

### Tier Thresholds (configurable)
| Tier | Referrals | Reward |
|------|-----------|--------|
| Bronze | 10 | Free month subscription (extends `subscription_expires_at` by 30 days) |
| Silver | 50 | Shop featured on homepage for 30 days (via `featured_shops` table) |
| Gold | 100 | Permanent reseller status (`profiles.is_reseller = true`) |

### Security
- The edge function runs with service role to modify profiles and featured_shops
- Users cannot self-grant tiers -- the function validates referral counts server-side
- `verify_jwt = false` in config.toml with manual auth validation in the function
