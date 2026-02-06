

# Verified Badges + Automated Email Reminders

## Part 1: Verified Buyer Badges

### Current State
- **Shops page**: Already shows "Verified" badge for shops with `is_verified = true` (green BadgeCheck icon + text badge)
- **Storefront page**: Already shows "Verified Business" badge on the shop header
- **Buyer verification**: The `profiles` table tracks `kyc_level`, `bvn_verified`, and `bank_verified`, but this info is **never shown** on reviews or anywhere buyers appear

### Changes

**1.1 Show Verified Buyer badge on product reviews**

Update `src/services/review.service.ts` to join `product_reviews` with `profiles` via `customer_id` to fetch the reviewer's `kyc_level`.

Update `src/pages/ProductDetails.tsx` review cards to show a small "Verified Buyer" badge (blue BadgeCheck icon) next to the reviewer's name when `kyc_level >= 2`.

**1.2 Enhance Shop Cards with rating/review count**

The shop cards on `src/pages/Shops.tsx` already show ratings via a star icon at the bottom. The verified badge is already prominent. No further changes needed here -- it's already well-implemented.

---

## Part 2: Automated Email Reminder System

### Current State
- `subscription-reminder` edge function: Fully coded, sends 3-day expiry warnings. Needs `pg_cron` scheduling.
- `send-notification-email` edge function: Has templates for `profile_incomplete`, `subscription_expiring`, `milestone_achieved`, `setup_complete`. But no automated trigger calls it.
- Auto-subscription via `paystack-webhook`: Working correctly.

### New Edge Function: `engagement-reminders`

Create a single comprehensive edge function that handles ALL engagement scenarios, using AI-generated tips where appropriate.

**Scenarios covered:**

| Scenario | Detection Logic | Email Content |
|----------|----------------|---------------|
| Incomplete registration (24h+) | `profiles` where `needs_role_selection = true` AND `created_at < now() - 24h` | "Complete your account setup" |
| No shop created (48h+) | `profiles` with `role = 'shop_owner'` but no matching `shops` entry, created 48h+ ago | "Create your first store" with tips |
| No products added (72h+) | `shops` with 0 products, created 72h+ ago | "Add your first product" with step-by-step guide |
| No sales for 7 days | `shops` where latest order is older than 7 days (or no orders ever) | AI-generated marketing tips |
| Subscription expiring (3 days) | Already handled by `subscription-reminder` | Already implemented |

**AI-Generated Tips**: For the "no sales" scenario, the function will call the Lovable AI (google/gemini-2.5-flash) to generate personalized marketing tips based on the shop's category and product types.

**Duplicate Prevention**: Each notification type per user is logged in `subscription_notifications` table (reusing existing table) with a check to avoid sending the same type within 7 days.

---

## Part 3: Database Changes

### Add notification types to support new scenarios

No schema changes needed -- the `subscription_notifications` table already has a flexible `notification_type` text column that can store any type string.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/engagement-reminders/index.ts` | **CREATE** | Comprehensive engagement reminder function |
| `src/services/review.service.ts` | **MODIFY** | Join with profiles to get reviewer kyc_level |
| `src/pages/ProductDetails.tsx` | **MODIFY** | Show "Verified Buyer" badge on reviews |

---

## Technical Details

### Review Service Update

```typescript
// Join product_reviews with profiles to get verification status
const { data, error, count } = await supabase
  .from('product_reviews')
  .select(`
    *,
    reviewer:profiles!customer_id(kyc_level)
  `, { count: 'exact' })
  .eq('product_id', productId)
  .order('created_at', { ascending: false })
  .range(from, to);
```

### Verified Buyer Badge in Reviews

```typescript
<div className="flex items-center gap-1">
  <CardTitle className="text-sm font-medium">
    {review.customer_name || "Anonymous"}
  </CardTitle>
  {review.reviewer?.kyc_level >= 2 && (
    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs px-1.5 py-0">
      <BadgeCheck className="w-3 h-3 mr-0.5" />
      Verified
    </Badge>
  )}
</div>
```

### Engagement Reminders Edge Function

The function will:

1. Query for each scenario (incomplete registration, no shop, no products, no sales)
2. Check `subscription_notifications` for recent sends of the same type per user
3. Generate AI tips for "no sales" scenario using Lovable AI
4. Send emails via Resend
5. Log each notification sent

```text
Flow:
  Function invoked (daily via pg_cron)
       |
       +-- Check incomplete registrations (24h+)
       |     +-- Send "Complete your account" email
       |
       +-- Check no shop created (48h+)
       |     +-- Send "Create your store" email with tips
       |
       +-- Check no products (72h+)
       |     +-- Send "Add products" email with guide
       |
       +-- Check no sales (7 days+)
             +-- Call AI for personalized tips
             +-- Send "Boost your sales" email with AI tips
```

### Scheduling (Manual Step Required)

After deployment, the following SQL must be run manually in the backend SQL editor to schedule both reminder functions daily:

```sql
-- Schedule engagement reminders daily at 9 AM UTC
SELECT cron.schedule(
  'engagement-reminders-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hwkcqgmtinbgyjjgcgmp.supabase.co/functions/v1/engagement-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    )
  );
  $$
);

-- Schedule subscription reminders daily at 8 AM UTC
SELECT cron.schedule(
  'subscription-reminder-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hwkcqgmtinbgyjjgcgmp.supabase.co/functions/v1/subscription-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## Expected Outcomes

| Feature | Result |
|---------|--------|
| Verified Buyer badges | Blue "Verified" badge shown on reviews from KYC Level 2+ users |
| Subscription reminders | Automated 3-day expiry emails (after cron setup) |
| Incomplete registration | Auto-email after 24 hours of inactivity |
| No shop created | Auto-email with tips after 48 hours |
| No products added | Auto-email with guide after 72 hours |
| No sales for a week | AI-generated marketing tips sent via email |
| Duplicate prevention | Same notification type not resent within 7 days per user |

