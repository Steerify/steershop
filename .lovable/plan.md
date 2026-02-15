

# Nigerian/African Images, 1% Split Payments via Paystack Subaccounts

## 1. Replace Images with Nigerian/African Business Photos

The current Unsplash images are generic. Replace them with photos featuring Nigerian/African/brown-skinned people in business settings, and distribute images strategically across multiple sections of the Index page -- not just one block.

### Image Placement Strategy

**Location A -- Hero showcase (below hero, above WhySteerSolo):** 4 images of African entrepreneurs
- A smiling Nigerian woman selling at her shop/market stall
- A young African man packaging orders at a desk
- An African woman using a smartphone for business
- A vibrant Nigerian market/shop display with colorful goods

**Location B -- Between "Value Proposition" and "How It Works" sections:** A single wide banner-style image of an African entrepreneur working confidently (with a subtle text overlay like "Built for businesses like yours")

**Location C -- Between "Social Proof" and "Featured Shops" sections:** 3 small circular profile-style photos of diverse Nigerian/African business owners, styled as testimonial avatars

All images will use curated Unsplash URLs specifically filtered for African/Nigerian subjects (e.g., `unsplash.com/photos/...` showing black/brown business owners, Lagos markets, African entrepreneurs).

### Files Modified
- `src/pages/Index.tsx` -- Replace existing image URLs and add 2 new small image sections

---

## 2. Implement 1% Automatic Commission via Paystack Split Payments

### How It Works (Current vs New)

**Currently:** Each shop uses their OWN Paystack public key. Money goes 100% to the shop. The "2.5% commission" is only recorded in the database -- never actually collected.

**New (Split Payments):** ALL order payments use Steerify's single Paystack secret key on the backend. Paystack automatically splits each payment: 99% settles into the shop owner's bank account (via their subaccount), 1% stays in Steerify's Paystack account. Instant, automatic, no manual collection.

### Technical Changes

#### A. Update Subaccount Creation (1% fee)
**File:** `supabase/functions/paystack-create-subaccount/index.ts`
- Change `percentage_charge: 0` to `percentage_charge: 1`
- This tells Paystack: "On every transaction through this subaccount, keep 1% for the main account (Steerify)"

#### B. New Edge Function: `paystack-initialize-order`
Create a new backend function that initializes order payments using Steerify's PAYSTACK_SECRET_KEY with the shop's subaccount code for split settlement.

**Logic:**
1. Receive order details (order_id, shop_id, amount, customer_email)
2. Look up the shop's `paystack_subaccount_code`
3. If no subaccount exists, reject (shop must set up bank details first)
4. Call Paystack "Initialize Transaction" API with:
   - Steerify's secret key (platform is the main merchant)
   - `subaccount: shop.paystack_subaccount_code` (99% goes to shop)
   - `bearer: "subaccount"` (Paystack fees charged to subaccount/shop)
5. Return the authorization URL for the customer to pay

#### C. Update CheckoutDialog.tsx
- Remove the shop's own `paystack_public_key` usage for order payments
- Instead, call the new `paystack-initialize-order` edge function
- Redirect customer to the returned Paystack authorization URL
- On callback, verify payment via the existing webhook

#### D. Update Webhook (fee percentage)
**File:** `supabase/functions/paystack-webhook/index.ts`
- Change `feePercentage` from `2.5` to `1`
- The webhook already records revenue and platform earnings -- just update the percentage

#### E. Update Frontend Revenue Display
**File:** `src/components/CheckoutDialog.tsx`
- Change `PLATFORM_FEE_PERCENTAGE` from `2.5` to `1`

#### F. Update Terms of Service
**File:** `src/pages/TermsOfService.tsx`
- Change "2.5%" to "1%" in the commission disclosure

#### G. Update Config
**File:** `supabase/config.toml`
- Register the new `paystack-initialize-order` function

### Payment Flow (New)

```text
Customer clicks "Pay Now"
    |
    v
Frontend calls paystack-initialize-order edge function
    |
    v
Edge function uses Steerify's PAYSTACK_SECRET_KEY
+ shop's subaccount_code to create transaction
    |
    v
Customer redirected to Paystack checkout page
    |
    v
Customer pays
    |
    v
Paystack splits automatically:
  - 99% -> Shop owner's bank (via subaccount)
  - 1% -> Steerify's Paystack balance
    |
    v
Webhook fires -> records revenue + platform earnings in DB
```

### What Shop Owners Need To Do

Shop owners no longer need their own Paystack public key. Instead, they need to:
1. Add their bank account details (bank name, account number)
2. The system creates a Paystack subaccount for them (already built)
3. Payments are automatically split

### Files Created/Modified

| File | Change |
|------|--------|
| `supabase/functions/paystack-initialize-order/index.ts` | NEW -- initializes split payment transactions |
| `supabase/functions/paystack-create-subaccount/index.ts` | Change percentage_charge from 0 to 1 |
| `supabase/functions/paystack-webhook/index.ts` | Change fee from 2.5% to 1% |
| `src/components/CheckoutDialog.tsx` | Use new edge function instead of shop's Paystack key |
| `src/pages/TermsOfService.tsx` | Update 2.5% to 1% |
| `src/pages/Index.tsx` | Replace images with African/Nigerian business photos |
| `supabase/config.toml` | Register paystack-initialize-order function |

