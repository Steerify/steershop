

# Phase 2: Wishlist, Coupons, Order Notifications Integration, and Payout Request UI

## What's Already Done (Phase 1)
- Database tables: `shop_payouts`, `shop_coupons`, `wishlists` + missing `orders` columns
- Revenue calculation fixed (only paid orders)
- Manual "Mark as Paid" records full amount (no platform fee for manual transfers)
- Order service supports extra fields (timestamps, cancelled_by)
- Payout service with balance/withdrawal logic
- Admin payout management tab
- Order timeline component on customer orders page
- `order-notifications` edge function code exists

## What's Broken / Not Connected (Phase 1 Gaps)
1. **order-notifications edge function is NOT registered in config.toml** -- it will fail to deploy
2. **order-notifications is never called from frontend** -- no emails are sent on order placement or status updates
3. **Wishlist table exists but no UI** -- customers cannot save or view wishlist items
4. **Shop coupons table exists but no UI** -- shop owners cannot create coupons, customers cannot apply them at checkout
5. **Shop owners have no payout request page** -- only admin can see payouts, shop owners cannot request withdrawals
6. **SocialProofStats still has hardcoded "5M+" for sales** -- needs to query actual paid order totals

## Implementation Plan

### 1. Register and Wire Order Notifications

**config.toml** -- Add the missing function registration:
```toml
[functions.order-notifications]
verify_jwt = false
```

**CheckoutDialog.tsx** -- After order creation, call the edge function to send confirmation email to the customer. Add a fire-and-forget call after `createOrderAndProcessPayment` succeeds.

**Orders.tsx** -- After `updateOrderStatus` succeeds, call the edge function with `eventType: "status_update"` so customers get notified of every status change.

### 2. Wishlist UI

**New file: `src/services/wishlist.service.ts`**
- `addToWishlist(productId)` -- insert into wishlists table
- `removeFromWishlist(productId)` -- delete from wishlists table
- `getWishlist()` -- fetch user's wishlist with product details
- `isInWishlist(productId)` -- check if product is wishlisted

**New file: `src/components/WishlistButton.tsx`**
- Heart icon button (outline = not saved, filled = saved)
- Toggle on click with optimistic UI
- Requires auth -- show toast prompting login if not authenticated

**ShopStorefront.tsx** -- Add WishlistButton to each product card (next to the Eye/view button)

**ProductDetails.tsx** -- Add WishlistButton on the product detail page

**New file: `src/pages/customer/CustomerWishlist.tsx`**
- List all wishlisted products with images, prices, and "Add to Cart" / "Remove" actions
- Link to the product's shop storefront page

**App.tsx** -- Add route `/customer/wishlist` protected for CUSTOMER role

**CustomerSidebar.tsx** -- Add "Wishlist" nav item with Heart icon

### 3. Shop Coupon System

**New file: `src/services/coupon.service.ts`**
- `createCoupon(data)` -- shop owner creates a discount code
- `getCoupons(shopId)` -- list all coupons for a shop
- `toggleCoupon(couponId, active)` -- enable/disable
- `deleteCoupon(couponId)` -- remove
- `validateCoupon(code, shopId)` -- check if coupon is valid, not expired, within usage limits

**Products.tsx or new Coupons section on Dashboard** -- Add a "Coupons" tab or section where shop owners can:
- Create coupons with: code, discount type (percentage/fixed), value, min order, max uses, valid dates
- View list of existing coupons with usage stats
- Toggle active/inactive

**CheckoutDialog.tsx** -- Add a coupon code input field:
- Text input + "Apply" button below the cart total
- On apply: call `validateCoupon`, if valid show discount line and adjusted total
- Pass coupon_id to the order record

### 4. Shop Owner Payout Request Page

**Dashboard.tsx** -- Add a "Payouts" card/section showing:
- Available balance (from payoutService.getBalance)
- "Request Payout" button (disabled if below 5,000 Naira minimum)
- Recent payout history

**New file: `src/components/PayoutRequestDialog.tsx`**
- Dialog/modal for requesting a payout
- Pre-fills bank details from shop's existing bank info
- Amount input (max = available balance, min = 5,000)
- Confirmation step before submitting
- Calls `payoutService.requestPayout`

### 5. Fix SocialProofStats

**SocialProofStats.tsx** -- Replace the hardcoded "5M+" sales figure:
- Query `orders` table for `SUM(total_amount)` where `payment_status = 'paid'`
- Format with appropriate suffix (K+, M+, B+)
- Also make avgRating dynamic by querying aggregate from `reviews` table

### 6. Test Phase 1 + Phase 2

After implementation, verify with browser testing:
- Place a test order and confirm the notification email function is invoked
- Update order status and verify status_update notification fires
- Add/remove products from wishlist as a customer
- Create a coupon as a shop owner, apply it during checkout
- Request a payout as a shop owner and verify it appears in admin panel
- Confirm dashboard revenue only shows paid orders
- Check homepage stats pull real data

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/config.toml` | MODIFY | Add `[functions.order-notifications]` registration |
| `src/components/CheckoutDialog.tsx` | MODIFY | Call order-notifications after order creation |
| `src/pages/Orders.tsx` | MODIFY | Call order-notifications after status update |
| `src/services/wishlist.service.ts` | CREATE | CRUD operations for wishlists table |
| `src/components/WishlistButton.tsx` | CREATE | Heart toggle button for products |
| `src/pages/customer/CustomerWishlist.tsx` | CREATE | Wishlist page for customers |
| `src/pages/ShopStorefront.tsx` | MODIFY | Add WishlistButton to product cards |
| `src/pages/ProductDetails.tsx` | MODIFY | Add WishlistButton to product detail |
| `src/components/CustomerSidebar.tsx` | MODIFY | Add Wishlist nav link |
| `src/App.tsx` | MODIFY | Add /customer/wishlist route |
| `src/services/coupon.service.ts` | CREATE | Coupon CRUD + validation |
| `src/components/CouponManager.tsx` | CREATE | Shop owner UI for managing coupons |
| `src/components/CheckoutDialog.tsx` | MODIFY | Add coupon input + discount calculation |
| `src/components/PayoutRequestDialog.tsx` | CREATE | Payout request modal for shop owners |
| `src/pages/Dashboard.tsx` | MODIFY | Add payout balance card + request button |
| `src/components/SocialProofStats.tsx` | MODIFY | Query real sales + rating data |

## Technical Details

### Order Notification Call Pattern
```typescript
// Fire-and-forget after order creation
const sendOrderNotification = async (orderId: string, eventType: string, extra?: Record<string, any>) => {
  try {
    await supabase.functions.invoke('order-notifications', {
      body: { orderId, eventType, ...extra }
    });
  } catch (e) {
    console.error('Notification failed (non-blocking):', e);
  }
};
```

### Wishlist Service
```typescript
export const wishlistService = {
  toggle: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Login required');
    
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();
    
    if (existing) {
      await supabase.from('wishlists').delete().eq('id', existing.id);
      return false; // removed
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
      return true; // added
    }
  },
};
```

### Coupon Validation
```typescript
validateCoupon: async (code: string, shopId: string, orderTotal: number) => {
  const { data, error } = await supabase
    .from('shop_coupons')
    .select('*')
    .eq('shop_id', shopId)
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();
  
  if (!data) return { valid: false, error: 'Invalid coupon code' };
  if (data.valid_until && new Date(data.valid_until) < new Date()) return { valid: false, error: 'Coupon expired' };
  if (data.max_uses && data.used_count >= data.max_uses) return { valid: false, error: 'Coupon fully redeemed' };
  if (data.min_order_amount && orderTotal < data.min_order_amount) return { valid: false, error: `Minimum order ₦${data.min_order_amount}` };
  
  const discount = data.discount_type === 'percentage' 
    ? Math.round(orderTotal * data.discount_value / 100) 
    : data.discount_value;
  
  return { valid: true, discount, coupon: data };
};
```
