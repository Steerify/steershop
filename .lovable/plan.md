# Fix Subscription Update, Paystack Payment Error, and Carousel Auto-slide

## 1. Update User Subscription to Business Plan

**Action:** Run a database update to set this user's subscription to the Business plan.

- Set `is_subscribed = true`
- Set `subscription_plan_id` to the Business plan ID (`949d3226-c472-4dcf-a234-5d911f282e95`)
- Extend `subscription_expires_at` by 30 days from now. Ill make sure that is how the algorithm works except the person chooses yearly plan ( 365 days )
- Insert a record into `subscription_history` for audit trail

---

## 2. Fix Paystack "Pay Before Service" Error

**Root Cause:** When a customer selects "Pay Before Service" with Paystack, the `paystack-initialize-order` edge function requires the shop to have a `paystack_subaccount_code` (for split payments). However, **zero shops** in the database have this field set. The function returns a `NO_SUBACCOUNT` error, blocking all Paystack payments.

**Fix:** Update the edge function to support a fallback flow when no subaccount exists:

- If a shop HAS a `paystack_subaccount_code` -- use split payment as before (shop gets paid directly, platform takes a cut)
- If a shop does NOT have a subaccount -- initialize a regular Paystack payment using the platform's secret key. The platform collects the full amount and settles with the shop later (via the existing payout system)

**File:** `supabase/functions/paystack-initialize-order/index.ts`

Changes:

- Remove the `NO_SUBACCOUNT` error block
- When `paystack_subaccount_code` is null, initialize payment WITHOUT the `subaccount` and `bearer` fields
- Log which flow was used (split vs direct) for debugging
- Add metadata flag `payment_mode: 'direct' | 'split'` so the webhook knows how to handle it

---

## 3. Fix Dashboard Carousel Auto-slide

**Root Cause:** The carousel in `Dashboard.tsx` has manual navigation (arrows + dots) but no auto-slide timer.

**Fix:** Add a `useEffect` with `setInterval` that advances the carousel every 5 seconds, pausing when the user hovers over it.

**File:** `src/pages/Dashboard.tsx`

Changes:

- Add a `useEffect` that runs `setInterval(nextSlide, 5000)` when `slides.length > 1`
- Track a `isPaused` state that pauses auto-slide on mouse enter and resumes on mouse leave
- Add `onMouseEnter` and `onMouseLeave` handlers to the carousel container
- Clean up the interval on unmount

---

## Technical Summary


| File                                                    | Change                                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Database (data update)                                  | Set user `a58d73f6...` to Business plan, `is_subscribed = true`, extend expiry       |
| `supabase/functions/paystack-initialize-order/index.ts` | Remove subaccount requirement; fall back to direct payment when no subaccount exists |
| `src/pages/Dashboard.tsx`                               | Add auto-slide interval (5s) with hover-to-pause for carousel                        |
