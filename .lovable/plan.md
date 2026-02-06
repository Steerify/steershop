

# Add Expired Account Re-subscription Reminder

## What This Does

Adds a 5th engagement reminder scenario: when a shop owner's subscription has been expired for more than 10 days, they receive a persuasive email encouraging them to resubscribe, highlighting what they're missing out on.

## Changes

**File:** `supabase/functions/engagement-reminders/index.ts`

Add a new **Scenario 5** after the existing 4 scenarios:

1. Add `expired_subscription: 0` to the `results` object
2. Query `profiles` for shop owners where:
   - `role = 'shop_owner'`
   - `subscription_expires_at` is more than 10 days in the past
   - `is_subscribed = false`
3. For each match, check `wasRecentlySent(userId, "expired_subscription_winback")` to avoid spam (7-day cooldown)
4. Send a persuasive email that includes:
   - What they're losing (store hidden from customers, no new orders, products invisible)
   - What they'll regain by subscribing (live store, WhatsApp orders, analytics, marketing tools, AI features)
   - A direct CTA button linking to `/subscription`
   - Mention of affordable pricing
5. Log the notification as `"expired_subscription_winback"`

## Email Content Highlights

The email will emphasize:
- Their store is currently hidden and customers cannot find them
- They are missing potential sales every day
- Benefits of resubscribing: visible storefront, order notifications, sales analytics, marketing poster editor, AI-powered tips, course access
- A clear "Reactivate My Store" call-to-action button

## Technical Notes

- Uses the same `wasRecentlySent` / `logNotification` / `sendEmail` helpers already in the function
- No database migration needed -- uses existing `profiles` columns (`subscription_expires_at`, `is_subscribed`) and the existing `subscription_notifications` table for deduplication
- Notification type: `expired_subscription_winback`
- 7-day cooldown between emails (same as other scenarios)
