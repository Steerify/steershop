

# Implementation Plan: Platform Transaction Fees (2-3%)

## Current State

The platform currently:
- Records revenue transactions when orders are paid
- Full order amount goes to shop owners
- No platform commission is collected or tracked

## Feature Overview

Add a platform transaction fee (configurable 2-3%) on all order payments that:
1. Automatically calculates the platform fee on each transaction
2. Records both shop revenue (net) and platform fee (commission)
3. Provides admin visibility into platform earnings
4. Supports configurable fee percentage

---

## Database Changes

### Add Platform Fee Columns to Revenue Transactions

```sql
ALTER TABLE public.revenue_transactions
ADD COLUMN gross_amount numeric,
ADD COLUMN platform_fee_percentage numeric DEFAULT 2.5,
ADD COLUMN platform_fee numeric DEFAULT 0;

-- Add platform earnings table for admin reporting
CREATE TABLE public.platform_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES revenue_transactions(id),
  shop_id uuid NOT NULL,
  order_id uuid,
  gross_amount numeric NOT NULL,
  fee_percentage numeric NOT NULL DEFAULT 2.5,
  fee_amount numeric NOT NULL,
  net_to_shop numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS: Only admins can view platform earnings
ALTER TABLE public.platform_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view platform earnings"
  ON public.platform_earnings FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert earnings"
  ON public.platform_earnings FOR INSERT
  WITH CHECK (true);
```

### Add Platform Settings Table (Optional)

```sql
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

INSERT INTO platform_settings (key, value) 
VALUES ('transaction_fee_percentage', '{"value": 2.5}'::jsonb);
```

---

## Edge Function Updates

### Update `paystack-webhook/index.ts`

When recording order payment revenue, calculate and store platform fee:

```typescript
// In charge.success handler for order payments
if (order_id && shop_id) {
  const grossAmount = event.data.amount / 100; // Paystack sends in kobo
  const feePercentage = 2.5; // Platform fee %
  const platformFee = Math.round(grossAmount * (feePercentage / 100) * 100) / 100;
  const netToShop = grossAmount - platformFee;

  // Record full revenue transaction with fee breakdown
  await supabase.from('revenue_transactions').insert({
    shop_id,
    order_id,
    amount: netToShop,       // Shop receives net amount
    gross_amount: grossAmount,
    platform_fee_percentage: feePercentage,
    platform_fee: platformFee,
    currency: event.data.currency || 'NGN',
    payment_reference: event.data.reference,
    payment_method: 'paystack',
    transaction_type: 'order_payment',
    metadata: {
      customer: event.data.customer,
      paystack_fees: event.data.fees,
    },
  });

  // Record platform earnings
  await supabase.from('platform_earnings').insert({
    transaction_id: null, // Will link after insert if needed
    shop_id,
    order_id,
    gross_amount: grossAmount,
    fee_percentage: feePercentage,
    fee_amount: platformFee,
    net_to_shop: netToShop,
  });
}
```

### Update `CheckoutDialog.tsx`

When recording manual payments or Paystack frontend callbacks:

```typescript
// Calculate platform fee
const PLATFORM_FEE_PERCENTAGE = 2.5;
const platformFee = Math.round(totalAmount * (PLATFORM_FEE_PERCENTAGE / 100) * 100) / 100;
const netToShop = totalAmount - platformFee;

// Record revenue with fee breakdown
await supabase.from("revenue_transactions").insert({
  shop_id: shop.id,
  order_id: orderId,
  amount: netToShop,
  gross_amount: totalAmount,
  platform_fee_percentage: PLATFORM_FEE_PERCENTAGE,
  platform_fee: platformFee,
  currency: 'NGN',
  payment_reference: response.reference,
  payment_method: 'paystack',
  transaction_type: 'order_payment',
});
```

---

## Admin Dashboard Updates

### Create Admin Platform Earnings Page

New file: `src/pages/admin/AdminPlatformEarnings.tsx`

Features:
- Total platform earnings (all time, this month, today)
- Earnings chart over time
- Transaction breakdown by shop
- Export functionality

```typescript
// Key metrics to display
const metrics = {
  totalEarnings: sum of platform_fee from revenue_transactions,
  thisMonthEarnings: filtered by current month,
  todayEarnings: filtered by today,
  transactionCount: count of transactions,
  averageFee: average platform_fee,
};
```

### Add to Admin Sidebar

```typescript
{ title: "Platform Earnings", url: "/admin/earnings", icon: DollarSign }
```

---

## Shop Owner Dashboard Updates

### Update Revenue Display

Show shop owners their net earnings (after platform fee):

```typescript
// In Dashboard.tsx revenue section
// Display: "Your Earnings: ₦X (after 2.5% platform fee)"
// Or show breakdown:
// Gross: ₦X
// Platform Fee (2.5%): -₦Y
// Your Earnings: ₦Z
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database Migration | Create | Add fee columns and platform_earnings table |
| `supabase/functions/paystack-webhook/index.ts` | Modify | Calculate and record platform fees |
| `src/components/CheckoutDialog.tsx` | Modify | Include fee calculation on frontend callbacks |
| `src/pages/admin/AdminPlatformEarnings.tsx` | Create | Admin earnings dashboard |
| `src/components/AdminSidebar.tsx` | Modify | Add earnings menu item |
| `src/App.tsx` | Modify | Add route for earnings page |
| `src/pages/Dashboard.tsx` | Modify | Show net earnings to shop owners |

---

## Fee Structure Options

| Tier | Fee | Notes |
|------|-----|-------|
| Flat Rate | 2.5% | Simple, consistent |
| Volume-Based | 2-3% | Lower fees for high-volume shops |
| Plan-Based | Basic 3%, Pro 2.5%, Business 2% | Incentivizes upgrades |

Recommendation: Start with a **flat 2.5%** fee and iterate based on feedback.

---

## Technical Considerations

1. **Backward Compatibility**: Existing transactions without fee columns will show `null` - they represent the old system where 100% went to shops

2. **Paystack Fees**: Note that Paystack also charges ~1.5% + ₦100. Total fees to customer would be:
   - Customer pays: ₦10,000
   - Paystack takes: ~₦250
   - Platform takes: ₦250 (2.5%)
   - Shop receives: ~₦9,500 net

3. **Display to Customers**: Whether to show the platform fee on checkout is a business decision. Many platforms hide it (included in price) while others show it transparently.

---

## Summary

This implementation adds a sustainable revenue model by collecting 2-3% on every transaction while:
- Maintaining transparency with shop owners
- Providing admin visibility into earnings
- Supporting future tiered pricing models
- Recording full audit trail

