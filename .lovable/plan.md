

# Implementation Plan: Shop Visibility, OG Meta Tags, Subscription Reminders & Admin Enhancements

## Summary of Requested Features

1. **Shop Visibility Based on Subscription** - Expired subscription shops should not appear on `/shops` page
2. **Dynamic Open Graph Meta Tags for Shop Storefronts** - When sharing shop links, show shop logo/description instead of SteerSolo branding
3. **Email Reminder for Subscription Expiration** - Send reminder 3 days before trial/subscription expires
4. **Admin Panel Enhancements**:
   - Show subscription plan name (Basic/Pro/Business) for each shop owner
   - View marketing consultation requests (YouTube Ads, Google Ads, etc.)
   - Allow adding courses for shop owners (not just customers)

---

## Part 1: Shop Visibility Based on Subscription

### Current State
The filtering logic in `shop.service.ts` already checks for valid subscriptions (lines 120-148), but there's a bug in the sorting - it uses the original `shops` array instead of the filtered `finalShops` array.

### Fix Required
Update `shop.service.ts` to sort the correct filtered array:

```typescript
// Line 163: Change from 'shops' to 'finalShops'
const sortedShops = [...finalShops].sort((a, b) => { ... });
```

This ensures only shops with valid subscriptions AND products are displayed and sorted.

---

## Part 2: Dynamic Open Graph Meta Tags for Shop Storefronts

### Challenge
Static HTML (`index.html`) cannot include dynamic shop data. Social media crawlers don't execute JavaScript, so React components can't inject OG meta tags.

### Solution
Create an Edge Function that generates HTML with proper OG meta tags for shop URLs. Configure the server to route `/shop/:slug` requests through this function for social media crawlers while serving the SPA for regular users.

### Implementation

#### 2.1 Create Edge Function: `shop-og-meta`

```typescript
// supabase/functions/shop-og-meta/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

serve(async (req) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    // Return default SteerSolo OG tags
    return generateDefaultHTML();
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );
  
  const { data: shop } = await supabase
    .from('shops')
    .select('shop_name, description, logo_url, banner_url')
    .eq('shop_slug', slug)
    .single();
  
  if (!shop) {
    return generateDefaultHTML();
  }
  
  // Generate HTML with shop-specific OG meta tags
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${shop.shop_name} | SteerSolo</title>
  <meta property="og:title" content="${shop.shop_name}" />
  <meta property="og:description" content="${shop.description || 'Shop on SteerSolo'}" />
  <meta property="og:image" content="${shop.logo_url || shop.banner_url || DEFAULT_IMAGE}" />
  <meta property="og:url" content="https://steersolo.com/shop/${slug}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${shop.shop_name}" />
  <meta name="twitter:description" content="${shop.description || 'Shop on SteerSolo'}" />
  <meta name="twitter:image" content="${shop.logo_url || shop.banner_url || DEFAULT_IMAGE}" />
  <meta http-equiv="refresh" content="0;url=https://steersolo.com/shop/${slug}">
</head>
<body>
  <p>Redirecting to ${shop.shop_name}...</p>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
});
```

#### 2.2 Update Vercel Rewrites (vercel.json)

```json
{
  "rewrites": [
    {
      "source": "/shop/:slug",
      "has": [{ "type": "header", "key": "user-agent", "value": "(facebookexternalhit|Twitterbot|WhatsApp|Slackbot|LinkedInBot|Discordbot)" }],
      "destination": "https://hwkcqgmtinbgyjjgcgmp.supabase.co/functions/v1/shop-og-meta?slug=:slug"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Part 3: Email Reminder for Subscription Expiration

### Strategy
Create a scheduled Edge Function (via pg_cron) that runs daily to find users whose subscriptions expire in exactly 3 days.

### Implementation

#### 3.1 Create Edge Function: `subscription-reminder`

```typescript
// supabase/functions/subscription-reminder/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
  
  // Find users whose subscription expires in 3 days
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  const startOfDay = new Date(threeDaysFromNow);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(threeDaysFromNow);
  endOfDay.setHours(23, 59, 59, 999);
  
  const { data: expiringUsers, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, subscription_expires_at, is_subscribed')
    .gte('subscription_expires_at', startOfDay.toISOString())
    .lte('subscription_expires_at', endOfDay.toISOString());
  
  if (error) throw error;
  
  // Check if notification already sent today
  for (const user of expiringUsers || []) {
    const { data: existing } = await supabase
      .from('subscription_notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('notification_type', 'subscription_expiring')
      .gte('sent_at', new Date().toISOString().split('T')[0])
      .maybeSingle();
    
    if (!existing) {
      // Send email via send-notification-email function
      await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'subscription_expiring',
          user_id: user.id,
          data: {
            daysRemaining: 3,
            subscription_expires_at: user.subscription_expires_at,
            pricingUrl: 'https://steersolo.com/pricing'
          }
        }
      });
    }
  }
  
  return new Response(JSON.stringify({ 
    success: true, 
    notified: expiringUsers?.length || 0 
  }));
});
```

#### 3.2 Schedule via pg_cron

Execute this SQL to create a daily cron job:

```sql
SELECT cron.schedule(
  'subscription-reminder-daily',
  '0 8 * * *',  -- 8 AM daily
  $$
  SELECT net.http_post(
    url:='https://hwkcqgmtinbgyjjgcgmp.supabase.co/functions/v1/subscription-reminder',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

---

## Part 4: Admin Panel Enhancements

### 4.1 Show Subscription Plan Name in Admin Shops

**Current Issue:** Admin fetches `subscription_plan_id` but doesn't display plan name.

**Fix:** Update `AdminShops.tsx` to:
1. Fetch subscription plans on load
2. Display plan name (Basic/Pro/Business) next to subscription badge

```typescript
// Add to fetchShops function
const { data: plans } = await supabase
  .from('subscription_plans')
  .select('id, name, slug');

const planMap = new Map(plans?.map(p => [p.id, p]) || []);

// In table display
const getPlanName = (planId: string | null) => {
  if (!planId) return 'No Plan';
  const plan = planMap.get(planId);
  return plan?.name || 'Unknown';
};

// Add column in table:
<TableCell>
  <Badge variant="outline" className={
    plan?.slug === 'business' ? 'bg-purple-100 text-purple-700' :
    plan?.slug === 'pro' ? 'bg-blue-100 text-blue-700' :
    'bg-gray-100 text-gray-700'
  }>
    {getPlanName(shop.profiles?.subscription_plan_id)}
  </Badge>
</TableCell>
```

### 4.2 Add Admin Marketing Consultations Page

**New File:** `src/pages/admin/AdminMarketingConsultations.tsx`

This page will:
- Fetch all records from `marketing_services` table with shop and owner details
- Display service type, status, consultation date, and shop owner info
- Allow admin to update status and schedule consultations

```typescript
const AdminMarketingConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  
  const fetchConsultations = async () => {
    const { data } = await supabase
      .from('marketing_services')
      .select(`
        *,
        shops(shop_name, owner_id),
        shops.profiles:owner_id(full_name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    setConsultations(data || []);
  };
  
  // Table with columns:
  // - Shop Name | Owner | Contact | Service Type | Status | Date | Actions
};
```

**Add to Admin Sidebar:**
```typescript
{ title: "Marketing Requests", url: "/admin/marketing", icon: Megaphone }
```

### 4.3 Add Target Audience to Courses

**Database Change:** Add `target_audience` column to `courses` table

```sql
ALTER TABLE public.courses 
ADD COLUMN target_audience text NOT NULL DEFAULT 'customer'
CHECK (target_audience IN ('customer', 'shop_owner', 'all'));

-- Update existing courses
UPDATE public.courses SET target_audience = 'customer';
```

**Update AdminCourses.tsx:**
- Add target audience dropdown in course form
- Display target audience badge in table

**Update Course Display Logic:**
- `CustomerCourses.tsx`: Filter courses where `target_audience IN ('customer', 'all')`
- Create new `ShopOwnerCourses.tsx` (or add to Dashboard): Filter where `target_audience IN ('shop_owner', 'all')`

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/services/shop.service.ts` | Modify | Fix sorting to use filtered shops array |
| `supabase/functions/shop-og-meta/index.ts` | Create | Dynamic OG meta tags for shop URLs |
| `supabase/config.toml` | Modify | Add `[functions.shop-og-meta]` config |
| `vercel.json` | Modify | Add rewrite rules for social crawlers |
| `supabase/functions/subscription-reminder/index.ts` | Create | Daily subscription expiry reminder |
| `src/pages/admin/AdminShops.tsx` | Modify | Display subscription plan name |
| `src/pages/admin/AdminMarketingConsultations.tsx` | Create | Marketing consultation requests page |
| `src/components/AdminSidebar.tsx` | Modify | Add Marketing Requests menu item |
| `src/App.tsx` | Modify | Add route for AdminMarketingConsultations |
| Database Migration | Create | Add `target_audience` column to courses |
| `src/pages/admin/AdminCourses.tsx` | Modify | Add target audience selector |
| `src/pages/customer/CustomerCourses.tsx` | Modify | Filter by target audience |

---

## Technical Notes

1. **Open Graph Meta Tags**: The edge function approach works because social media crawlers execute HTTP requests but don't run JavaScript. We detect crawlers via User-Agent and return pre-rendered HTML.

2. **Cron Job Setup**: The pg_cron extension must be enabled. The job runs daily at 8 AM UTC.

3. **Subscription Plans**: Already exist in database with IDs for Basic, Pro, and Business tiers.

4. **Marketing Services Data**: Currently has 2 consultation requests (YouTube Ads, General Consultation) from "SteerSolo" shop.

