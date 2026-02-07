

# SteerSolo Platform Audit and Revenue System Renovation

## Executive Summary

After a deep audit of the codebase, database, revenue flows, and user journeys, I've identified critical gaps that are costing SteerSolo growth, revenue, and user retention. This plan addresses what the platform is missing, doing wrong, and needs to do differently -- benchmarked against global e-commerce marketplace standards (Shopify, Jumia, Etsy) and Nigerian market realities.

---

## Part 1: What SteerSolo Is NOT Doing (Critical Missing Features)

### 1.1 No Order Tracking for Customers
Customers place orders and have zero visibility into what happens next. There's no real-time status updates, no push/email notifications when order status changes. This is the #1 reason for customer churn on marketplaces globally.

**Fix:** Add an order status notification system -- when a shop owner updates an order status (confirmed, processing, out_for_delivery, delivered), the customer receives an email notification automatically. Add a visual order timeline on the customer orders page.

### 1.2 No Delivery Fee / Location Management
The `orders` table has no `delivery_city`, `delivery_state`, `delivery_fee`, or `notes` columns despite the order service code referencing them. Orders are created with these fields but they silently fail/get ignored at the database level.

**Fix:** Add missing columns to the `orders` table via migration.

### 1.3 No Wishlist / Save for Later
Customers cannot save products they're interested in. This is standard on every marketplace worldwide and is critical for conversion.

**Fix:** Add a `wishlists` table and UI for customers to save and revisit products.

### 1.4 No Automated Email on Order Placement
When a customer places an order, neither the customer nor the shop owner gets an email confirmation. Shop owners only know about orders if they check their dashboard or receive a WhatsApp message.

**Fix:** Add an `order-notification` edge function triggered on order creation that emails both the customer (confirmation) and the shop owner (new order alert).

### 1.5 No Discount / Coupon System for Shop Owners
Shop owners have no way to create discount codes or run promotions for their own products. This is essential for customer acquisition and retention.

**Fix:** Add a `shop_coupons` table and coupon application during checkout.

---

## Part 2: What SteerSolo Is Doing WRONG

### 2.1 Revenue System Has No Payouts / Settlement Mechanism
The biggest flaw: SteerSolo collects 2.5% platform fees and records revenue, but there is **no mechanism for shop owners to actually receive their money**. The `revenue_transactions` table tracks net-to-shop amounts, but there's no:
- Payout request system
- Settlement schedule
- Bank account verification for payouts
- Payout history
- Minimum withdrawal threshold

Shop owners see revenue on their dashboard but cannot withdraw it. This is a fundamental trust and legal issue.

### 2.2 Revenue Dashboard Shows Orders Total, Not Actual Revenue
The Dashboard calculates `totalRevenue` by summing ALL order amounts (line 209), not just paid orders. This inflates the revenue figure with unpaid/cancelled orders.

### 2.3 Manual "Mark as Paid" Records Revenue Without Platform Fee
When shop owners use "Mark as Paid" on manual orders (Orders.tsx line 264), the revenue is recorded WITHOUT the 2.5% platform fee deduction. This means the platform loses its commission on all cash/bank transfer orders.

### 2.4 Order Status Flow is Broken
- `updateOrderStatus` only updates the `status` field but the service function doesn't pass through the extra fields like `cancelled_by`, `cancelled_at`, `delivered_at` (Orders.tsx lines 218-234 prepare updateData but then only call `orderService.updateOrderStatus(orderId, status)` which ignores all the extra fields).
- Order status `confirmed` is overloaded -- used both for order confirmation AND as a "paid manually" indicator.

### 2.5 Homepage Stats Are Hardcoded/Fake
The homepage claims "5,000+ businesses" and "2.8B+ in sales" (Index.tsx lines 98, 278) but the actual database has **7 shops** and **4,600 in total paid revenue**. This destroys trust if customers investigate.

### 2.6 WhatsApp Community Link is Placeholder
The `WhatsAppCommunityBanner` component has `YOUR_COMMUNITY_LINK` as the URL. It's live but broken.

---

## Part 3: What SteerSolo Is Not Doing RIGHT

### 3.1 No Refund Policy or Dispute Resolution
There is no refund mechanism, no dispute flow, no cancellation policy for customers. Globally, this is a legal requirement and a trust signal.

### 3.2 No Email Receipts
After payment (Paystack or manual), customers receive no email receipt. This is required by Nigerian consumer protection regulations and is standard globally.

### 3.3 Search is Client-Side Only
Shop search filters locally after fetching all shops. With scale, this will break. Product search exists but shop search doesn't use server-side filtering.

---

## Part 4: The Revenue System Renovation

This is the full overhaul of how money flows through the platform.

### 4.1 New Database Tables

**`shop_payouts`** - Track withdrawal requests and settlements:
- id, shop_id, amount, status (pending/processing/completed/failed), bank_name, account_number, account_name, requested_at, processed_at, reference, notes

**`shop_coupons`** - Shop-specific discount codes:
- id, shop_id, code, discount_type (percentage/fixed), discount_value, min_order_amount, max_uses, used_count, valid_from, valid_until, is_active

**`wishlists`** - Customer saved products:
- id, user_id, product_id, created_at

**Missing columns on `orders`:**
- delivery_city, delivery_state, delivery_fee (numeric default 0), notes

### 4.2 Fix Revenue Recording

1. **Dashboard revenue calculation**: Only sum orders where `payment_status = 'paid'`
2. **Manual "Mark as Paid"**: Apply 2.5% platform fee deduction same as Paystack flow
3. **Order status update service**: Accept and persist all status-related fields (timestamps, cancelled_by)

### 4.3 Add Payout System

Shop owners should be able to:
1. View their available balance (total net revenue minus already-withdrawn amounts)
2. Request a payout (minimum threshold: 5,000 Naira)
3. See payout history and status
4. Have bank details verified before first payout

Admin should be able to:
1. View all pending payout requests
2. Approve/process/reject payouts
3. See platform earnings summary

### 4.4 Fix the Order Lifecycle

Standardize the order status flow:
```text
pending -> confirmed -> processing -> out_for_delivery -> delivered -> completed
                                                                    \-> cancelled
```

Each transition triggers:
- Database timestamp update
- Customer email notification
- Dashboard real-time update

### 4.5 Add Order Notification Edge Function

New `order-notifications` edge function that sends emails:
- **To customer**: Order confirmation, status updates, delivery confirmation
- **To shop owner**: New order alert, payment received confirmation

---

## Part 5: Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database migration | CREATE | Add `shop_payouts`, `shop_coupons`, `wishlists` tables; add missing `orders` columns |
| `supabase/functions/order-notifications/index.ts` | CREATE | Email notifications for order lifecycle events |
| `src/services/order.service.ts` | MODIFY | Fix updateOrderStatus to accept all fields; add proper revenue calculation |
| `src/services/revenue.service.ts` | MODIFY | Add getBalance, requestPayout, getPayoutHistory methods |
| `src/pages/Dashboard.tsx` | MODIFY | Fix revenue calculation to only count paid orders |
| `src/pages/Orders.tsx` | MODIFY | Fix "Mark as Paid" to include platform fee; fix status update to pass all fields |
| `src/components/CheckoutDialog.tsx` | MODIFY | Add delivery fee field, coupon code input, trigger order notification |
| `src/pages/Index.tsx` | MODIFY | Replace hardcoded stats with dynamic real data from database |
| `src/components/WhatsAppCommunityBanner.tsx` | MODIFY | Fix placeholder link |
| `src/components/OrderTimeline.tsx` | MODIFY | Add to customer order view for visual tracking |
| `src/pages/customer/CustomerOrders.tsx` | MODIFY | Add order timeline, delivery tracking visibility |
| `src/pages/admin/AdminPlatformEarnings.tsx` | MODIFY | Add payout management section |

---

## Priority Order

1. **Database migration** (foundation for everything)
2. **Revenue fixes** (money accuracy is non-negotiable)
3. **Order notification emails** (immediate customer satisfaction impact)
4. **Payout system** (shop owner trust and retention)
5. **Homepage dynamic stats** (credibility)
6. **WhatsApp link fix** (quick win)
7. **Wishlist and coupons** (growth features)

This is a significant renovation. Given the scope, I recommend implementing it in 2-3 phases. Should I proceed with Phase 1 (items 1-3: database migration, revenue fixes, and order notifications)?
pls consider the fact that the manual transfer is going straight to their account and not to us in anyway...the charts are just to see the flow of money into their account 
