

# SteerSolo Comprehensive Enhancement Plan

## Executive Summary

This plan addresses four major areas:
1. **Shop Owner CRUD & Product/Service Display Fixes** - Fix issues in product service, frontend display, and data handling
2. **Admin Activity Logging System** - Create comprehensive audit trail for all platform activities
3. **Custom Subdomains (shopname.steersolo.com)** - Custom subdomain routing for stores
4. **Frontend Optimization for Quick Signup/Login** - Streamline user onboarding with reduced text

---

## Part 1: Shop Owner CRUD & Display Fixes

### Issues Identified

| Issue | Location | Details |
|-------|----------|---------|
| Products not saving `duration_minutes` and `booking_required` | `product.service.ts` line 30-41 | These fields are missing from the INSERT statement |
| Services not displaying correctly | `ShopStorefront.tsx` | Type casting needs validation |
| Product image not updating correctly | `product.service.ts` line 155 | Conditional check may skip update |
| `getProducts` filters out unavailable items | `product.service.ts` line 64 | Shop owners can't see their own unavailable products |
| Missing error handling in product operations | Multiple files | API errors not properly caught/displayed |

### Fixes Required

#### 1.1 Fix Product Service - Save All Service Fields

```typescript
// product.service.ts line 28-41
// CURRENT: Missing duration_minutes and booking_required in insert
const { data: product, error } = await supabase
  .from('products')
  .insert({
    shop_id: data.shopId,
    name: data.name,
    description: data.description,
    price: data.price,
    stock_quantity: data.inventory,
    image_url: primaryImage,
    type: data.type || 'product',
    is_available: true,
    // MISSING: duration_minutes, booking_required
  })

// FIX: Add missing fields
.insert({
  shop_id: data.shopId,
  name: data.name,
  description: data.description,
  price: data.price,
  stock_quantity: data.inventory,
  image_url: primaryImage,
  type: data.type || 'product',
  is_available: data.is_available !== undefined ? data.is_available : true,
  duration_minutes: data.duration_minutes || null,
  booking_required: data.booking_required || false,
})
```

#### 1.2 Fix Product Query for Shop Owners

```typescript
// product.service.ts - Allow shop owners to see unavailable products
getProducts: async (params?: { shopId?: string; page?: number; limit?: number; includeUnavailable?: boolean }) => {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });

  // Only filter by is_available if not explicitly requesting all
  if (!params?.includeUnavailable) {
    query = query.eq('is_available', true);
  }
  // Rest of implementation...
}
```

#### 1.3 Add Proper Error Display in Products Page

```typescript
// Products.tsx - Add toast on API errors
} catch (error: any) {
  toast({
    title: "Error",
    description: error.message || "Failed to save product",
    variant: "destructive",
  });
}
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/services/product.service.ts` | Add `duration_minutes`, `booking_required`, `is_available` to insert; fix update logic |
| `src/pages/Products.tsx` | Add proper error handling, verify form data mapping |
| `src/pages/ShopStorefront.tsx` | Verify type handling for services |
| `src/pages/Orders.tsx` | Add service type indicator in order items |

---

## Part 2: Admin Activity Logging System

### Overview

Create a comprehensive audit trail system to track all platform activities including:
- User actions (login, signup, profile updates)
- Shop actions (create, update, delete)
- Order actions (status changes, payments)
- Product actions (CRUD operations)
- Admin actions (user management, settings changes)

### Database Schema

```sql
-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
  resource_type TEXT NOT NULL, -- 'shop', 'product', 'order', 'user', 'booking', etc.
  resource_id UUID,
  resource_name TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Index for efficient querying
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view all activity logs" ON activity_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- System can insert logs (via edge function or service role)
CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);
```

### Activity Log Service

```typescript
// src/services/activity-log.service.ts
interface ActivityLogEntry {
  action_type: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'approve' | 'reject';
  resource_type: 'shop' | 'product' | 'order' | 'booking' | 'user' | 'review' | 'subscription' | 'payment';
  resource_id?: string;
  resource_name?: string;
  details?: Record<string, any>;
}

const activityLogService = {
  log: async (entry: ActivityLogEntry) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('activity_logs').insert({
      user_id: user?.id,
      user_email: user?.email,
      action_type: entry.action_type,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      resource_name: entry.resource_name,
      details: entry.details,
      user_agent: navigator.userAgent,
    });
  },
  
  getActivityLogs: async (params: {
    page?: number;
    limit?: number;
    resource_type?: string;
    action_type?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    // Implementation for admin dashboard
  }
};
```

### Admin Activity Dashboard Page

Create `src/pages/admin/AdminActivityLogs.tsx`:
- Filterable table showing all activities
- Filter by: date range, action type, resource type, user
- Export to CSV functionality
- Real-time updates using Supabase realtime

### Files to Create

| File | Purpose |
|------|---------|
| `src/services/activity-log.service.ts` | Activity logging service |
| `src/pages/admin/AdminActivityLogs.tsx` | Admin activity dashboard |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/AdminSidebar.tsx` | Add "Activity Logs" menu item |
| `src/App.tsx` | Add route for activity logs |
| `src/services/product.service.ts` | Add activity logging on CRUD |
| `src/services/shop.service.ts` | Add activity logging on CRUD |
| `src/services/order.service.ts` | Add activity logging on status changes |
| `src/context/AuthContext.tsx` | Add login/logout activity logging |

---

## Part 3: Custom Subdomains (shopname.steersolo.com)

### Technical Assessment

Implementing `shopname.steersolo.com` subdomains requires:

1. **Wildcard DNS Configuration** - DNS A record for `*.steersolo.com`
2. **Server-side Routing** - Handle subdomain extraction and routing
3. **SSL Certificates** - Wildcard SSL for `*.steersolo.com`
4. **Database Updates** - Store subdomain preferences

### Current Architecture Limitation

SteerSolo runs on Lovable/Vercel with static hosting. True subdomain routing requires:
- Backend infrastructure changes (reverse proxy like Nginx or Cloudflare Workers)
- Custom domain setup at the hosting level
- This is NOT achievable purely in frontend code

### Alternative Approaches

#### Option A: Path-Based URLs (Current - `/shop/shopname`)
- Already implemented
- Works with current infrastructure
- Example: `steersolo.com/shop/elegance-collections`

#### Option B: Subdomain Redirect Service
- Create a subdomain redirect that maps to paths
- Requires external service (Cloudflare Workers, AWS Lambda)
- User visits `shopname.steersolo.com` → redirects to `steersolo.com/shop/shopname`

#### Option C: Custom Domain per Shop (Future)
- Allow shop owners to connect their own domains
- Use CNAME records pointing to `steersolo.com`
- Requires SSL certificate management

### Recommended Implementation

**Phase 1 (Now)**: Improve path-based URLs with prettier links
```text
Current: steersolo.com/shop/my-store-slug
Improved: steersolo.com/s/my-store-slug (shorter)
```

**Phase 2 (Future)**: Subdomain support via edge workers
- Requires infrastructure investment
- Cloudflare Workers or Vercel Edge Middleware
- Budget: Approximately $5-20/month

### Frontend Changes for Phase 1

```typescript
// Add short URL route in App.tsx
<Route path="/s/:slug" element={<ShopStorefront />} />

// Update shop sharing component to use shorter URL
const shareUrl = `${window.location.origin}/s/${shop.shop_slug}`;
```

---

## Part 4: Frontend Optimization for Quick Signup/Login

### Issues Identified

1. **Auth Page** (`src/pages/Auth.tsx`) - 552 lines, complex with too many form fields
2. **Homepage** (`src/pages/Index.tsx`) - 1035 lines, information overload
3. **Signup form** requires 6 fields upfront (email, password, first name, last name, phone, role)
4. **No progressive disclosure** - all fields shown at once

### Optimization Strategy

#### 4.1 Simplified Auth Flow

**Current Flow:**
```text
Login: Email + Password + Remember Me
Signup: First Name + Last Name + Email + Phone + Password + Role Selection
```

**Proposed Flow:**
```text
Login: Email + Password (Google prominent)
Signup: 
  Step 1: Email + Password OR Google (primary)
  Step 2: Role Selection (if new user)
  Step 3: Profile completion (optional, dashboard prompt)
```

#### 4.2 Auth Page Redesign

```typescript
// Simplified Auth.tsx structure
- Remove inline role selection from signup
- Make Google Sign-In the primary action
- Progressive form with 2 steps maximum
- Collect name/phone later during onboarding
```

**Signup Form Reduction:**
| Current | Proposed |
|---------|----------|
| First Name | → Move to onboarding |
| Last Name | → Move to onboarding |
| Phone | → Move to onboarding |
| Email | Keep |
| Password | Keep |
| Role | → Separate page after signup |

#### 4.3 Homepage Text Reduction

Current sections with excessive text:
- `EntrepreneurHero` - 5 bullet points + paragraph
- `TheSteerSoloWaySection` - Multiple cards with descriptions
- `GrowthJourneySection` - 3 cards with long text
- Multiple testimonial sections

**Proposed Changes:**
1. **Hero**: Single value proposition + CTA (remove bullet list)
2. **How It Works**: 3 icons only, one-liner each
3. **Social Proof**: Numbers only, minimal text
4. **Trust Badges**: Icons without lengthy descriptions

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Simplify form, 2-step signup, prominent Google |
| `src/pages/Index.tsx` | Reduce text, visual-first approach |
| `src/pages/entrepreneur/Onboarding.tsx` | Add name/phone collection |
| `src/components/HowItWorks.tsx` | Simplify to icons + one-liners |

### Visual Improvements

```text
BEFORE (Auth Page):
┌─────────────────────────────────────┐
│  Welcome to SteerSolo               │
│  Your business journey starts here  │
│  ─────────────────────────────────  │
│  [Login] [Sign Up]                  │
│  ─────────────────────────────────  │
│  [Google Button]                    │
│  ─── or continue with email ───     │
│  First Name: [_________]            │
│  Last Name: [__________]            │
│  Email: [______________]            │
│  Phone: [______________]            │
│  Password: [___________]            │
│  Role: ○ Business ○ Customer        │
│  [Create Account]                   │
└─────────────────────────────────────┘

AFTER (Auth Page):
┌─────────────────────────────────────┐
│           [SteerSolo Logo]          │
│        Start Growing Today          │
│                                     │
│    [🔵 Continue with Google]        │
│                                     │
│    ─────── or ───────              │
│                                     │
│  Email: [______________]            │
│  Password: [___________]            │
│                                     │
│  [Create Account / Login]           │
│                                     │
│  Already have account? [Login]      │
└─────────────────────────────────────┘
```

---

## Implementation Priority

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 1 | Fix Product Service CRUD | 2 hours | High - Core functionality |
| 2 | Simplify Auth Page | 3 hours | High - Conversion rate |
| 3 | Homepage Text Reduction | 2 hours | Medium - User experience |
| 4 | Admin Activity Logging | 4 hours | Medium - Audit compliance |
| 5 | Short URL Route (/s/slug) | 30 mins | Low - Nice-to-have |
| 6 | Custom Subdomains | Future | Low - Infrastructure needed |

---

## Technical Details

### Database Migrations Required

```sql
-- Migration 1: Activity Logs Table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  resource_name TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all activity logs" ON activity_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);
```

### Files Summary

**New Files (4):**
1. `src/services/activity-log.service.ts`
2. `src/pages/admin/AdminActivityLogs.tsx`
3. Database migration for activity_logs table

**Modified Files (12):**
1. `src/services/product.service.ts` - Fix CRUD fields
2. `src/pages/Products.tsx` - Error handling
3. `src/pages/Auth.tsx` - Simplify signup
4. `src/pages/Index.tsx` - Reduce text
5. `src/components/HowItWorks.tsx` - Simplify
6. `src/components/AdminSidebar.tsx` - Add activity logs link
7. `src/App.tsx` - Add routes
8. `src/services/shop.service.ts` - Add logging
9. `src/services/order.service.ts` - Add logging
10. `src/context/AuthContext.tsx` - Add login logging
11. `src/pages/entrepreneur/Onboarding.tsx` - Collect name/phone
12. `src/pages/MyStore.tsx` - Share URL update

---

## Notes on Custom Subdomains

The request for `shopname.steersolo.com` configuration requires infrastructure-level changes that are outside the scope of frontend development. This would require:

1. **DNS Configuration**: Wildcard A record `*.steersolo.com` pointing to your server
2. **Hosting Platform Support**: Vercel/Lovable needs to support wildcard domains
3. **SSL Certificate**: Wildcard SSL for `*.steersolo.com`
4. **Edge Middleware**: To parse subdomains and route to correct shops

**Recommendation**: Use the improved path-based URL (`/s/shopname`) for now, and consider subdomain routing as a future infrastructure investment when the platform scales.

