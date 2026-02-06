
# Trial Days Algorithm Audit - Findings & Fixes

## Executive Summary

The **core trial algorithm is working correctly** at the database and security levels. However, there are **text inconsistencies** across the UI that need to be fixed to match the official 15-day trial period.

---

## Algorithm Analysis

### What's Working Correctly

| Component | Location | Status |
|-----------|----------|--------|
| **Database Trigger** | `handle_new_user()` function | Sets `subscription_expires_at = now() + interval '15 days'` for shop owners |
| **Subscription Utility** | `src/utils/subscription.ts` | Correctly calculates days remaining using `Math.ceil()` for accurate rounding |
| **RLS Enforcement** | `shop_has_valid_subscription()` function | Properly checks both trial and paid subscriptions |
| **DynamicPricing** | `src/components/DynamicPricing.tsx:119` | Correctly states "15-day free trial" |

### Core Algorithm Logic (Verified Working)

```text
Database Level:
┌─────────────────────────────────────────────────────────────┐
│ User Signs Up (shop_owner role)                             │
│                    ↓                                        │
│ handle_new_user() trigger fires                             │
│                    ↓                                        │
│ subscription_expires_at = now() + 15 days                   │
│ is_subscribed = false                                       │
└─────────────────────────────────────────────────────────────┘

Frontend Level:
┌─────────────────────────────────────────────────────────────┐
│ calculateSubscriptionStatus(profileData)                    │
│                    ↓                                        │
│ IF is_subscribed = false AND expires_at > now()            │
│   → status: 'trial', daysRemaining: Math.ceil(diff)        │
│                    ↓                                        │
│ IF is_subscribed = true AND expires_at > now()             │
│   → status: 'active', daysRemaining: Math.ceil(diff)       │
│                    ↓                                        │
│ ELSE → status: 'expired', daysRemaining: 0                 │
└─────────────────────────────────────────────────────────────┘

RLS Enforcement:
┌─────────────────────────────────────────────────────────────┐
│ shop_has_valid_subscription(shop_id)                        │
│                    ↓                                        │
│ Returns TRUE if:                                            │
│ - (is_subscribed = true AND expires_at > now()) OR         │
│ - (is_subscribed = false AND expires_at > now())           │
│                    ↓                                        │
│ Shops/Products hidden if function returns FALSE            │
└─────────────────────────────────────────────────────────────┘
```

---

## Issues Found - Text Inconsistencies

### Issue 1: Hardcoded Fallback Values (7 days instead of 15)

**Location 1: `src/pages/Dashboard.tsx` (line 163)**
```typescript
// Current (incorrect fallback):
setDaysRemaining(7);

// Should be:
setDaysRemaining(15);
```

**Location 2: `src/hooks/use-shop-owner-auth.ts` (line 55)**
```typescript
// Current (incorrect fallback):
setDaysRemaining(7);

// Should be:
setDaysRemaining(15);
```

### Issue 2: UI Copy Mentions Wrong Trial Duration

**Location 1: `src/pages/FAQ.tsx` (line 52)**
```text
Current: "SteerSolo offers a 14-day free trial..."
Should be: "SteerSolo offers a 15-day free trial..."
```

**Location 2: `src/pages/Index.tsx` (line 441)**
```text
Current: "Start 7-Day Free Trial"
Should be: "Start 15-Day Free Trial"
```

**Location 3: `src/components/SimplePricing.tsx` (if still in use)**
```text
Any references to 7-day trials should be updated to 15-day
```

---

## Files to Modify

| File | Line | Change |
|------|------|--------|
| `src/pages/Dashboard.tsx` | 163 | Change fallback from `7` to `15` |
| `src/hooks/use-shop-owner-auth.ts` | 55 | Change fallback from `7` to `15` |
| `src/pages/FAQ.tsx` | 52 | Change "14-day" to "15-day" |
| `src/pages/Index.tsx` | 441 | Change "7-Day" to "15-Day" |

---

## Implementation

### Step 1: Fix Dashboard.tsx Fallback
Update line 163 to use 15 days instead of 7:
```typescript
setDaysRemaining(15);
```

### Step 2: Fix use-shop-owner-auth.ts Fallback
Update line 55 to use 15 days instead of 7:
```typescript
setDaysRemaining(15);
```

### Step 3: Fix FAQ.tsx Text
Update line 52 to mention 15-day trial:
```typescript
answer: "SteerSolo offers a 15-day free trial that gives you full access to all features..."
```

### Step 4: Fix Index.tsx Button Text
Update line 441 to show correct trial duration:
```typescript
<Button className="w-full bg-primary hover:bg-primary/90">Start 15-Day Free Trial</Button>
```

---

## Summary

| Aspect | Status |
|--------|--------|
| **Database trigger (15 days)** | Working correctly |
| **Subscription calculation** | Working correctly |
| **RLS enforcement** | Working correctly |
| **UI text consistency** | **Needs fixing** - 4 locations have wrong trial duration |

The trial algorithm itself is solid. The fixes are purely cosmetic text updates to ensure the UI matches the actual 15-day trial period configured in the database.
