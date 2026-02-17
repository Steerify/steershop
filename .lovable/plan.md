# SEO Enhancement, Paystack Fee Pass-through, DFY Product Collection, and Subscription Section Update

## 1. SEO/AEO: Make Stores Discoverable by AI and Search Engines

### Problem

The current meta tags use narrow keywords like "steersolo" and "Nigerian e-commerce." People searching broader terms like "online store builder Africa," "sell on WhatsApp Nigeria," or "free online shop" won't find you.

### Changes

`**index.html**` -- Expand meta keywords with high-converting search terms:

- "create online store Nigeria", "online store for WhatsApp sellers", "WhatsApp store builder Nigeria", "sell on WhatsApp with payment", "Paystack store builder", "accept payments on WhatsApp", "online store with Paystack", "how to collect payments online Nigeria", "online shop link for WhatsApp", "Instagram store with payment link", "one link shop Nigeria", "checkout link for WhatsApp business", "simple ecommerce for small business Nigeria", "online store without website Nigeria", "WhatsApp checkout Nigeria", "customers not paying online Nigeria", "how to stop fake orders online", "how to manage WhatsApp orders", "tracking orders on WhatsApp", "too many DMs selling problem", "how to organize online sales", "selling on Instagram stress", "how to look professional online seller", "order management for WhatsApp business", "small business payment issues Nigeria", "tools for Instagram sellers Nigeria", "WhatsApp selling tools", "sell on Instagram Nigeria", "WhatsApp business tools for vendors", "social commerce Nigeria", "selling on WhatsApp Nigeria", "Instagram DM sales tool", "WhatsApp catalog alternatives", "WhatsApp business store setup", "how to sell online as a beginner Nigeria", "online business ideas Nigeria", "how to start selling online Nigeria", "free tools for online business Nigeria", "how to sell without a website", "online selling tips Nigeria", "best way to sell online Nigeria", "how to start ecommerce Nigeria", "online selling for students Nigeria", "small business ecommerce Nigeria", "online tools for SMEs Nigeria", "digital tools for small businesses", "affordable ecommerce Nigeria", "business website alternative Nigeria", "online sales tools Nigeria", "ecommerce solution for SMEs", "Nigerian business selling tools", "online store builder Africa", "WhatsApp store Africa", "Paystack ecommerce Africa", "sell online Africa", "small business ecommerce Africa", "online selling tools Africa", "African online marketplace alternative", "how to create an online store with Paystack in Nigeria", "how to sell on WhatsApp and receive payments", "best online store for Instagram sellers in Nigeria", "how to accept card payments as small business Nigeria", "online store for vendors without website", "simple online shop for Nigerian vendors", "tools for WhatsApp business owners Nigeria", "how to sell online in Nigeria", "WhatsApp business store", "online shop builder", "ecommerce platform Nigeria", "create online store free", "sell products online", "Nigerian online marketplace", "Paystack online store", "small business website Nigeria", "Instagram seller tools", "how to start online business Nigeria", "free online store builder Africa", "mobile store builder", "sell on social media Nigeria", "online store for beginners"

`**src/components/SEOSchemas.tsx**` -- Add additional structured data:

- Add `alternateName` array with high-discovery terms: "SteerSolo Nigeria", "Steer Solo", "SteerSolo Online Store Builder", "Nigerian Online Store Creator"
- Add `knowsAbout` to Organization schema: "e-commerce", "online selling", "WhatsApp business", "Nigerian small business"
- Add a `BreadcrumbList` schema for better search result display
- Update FAQ schema with new questions targeting high-traffic search terms:
  - "How do I start selling online in Nigeria?"
  - "What's the best online store builder for small businesses in Nigeria?"
  - "How do I create a WhatsApp store?"

`**supabase/functions/shop-og-meta/index.ts**` -- Enhance individual shop SEO:

- Add `address` with shop's state/country to the LocalBusiness JSON-LD
- Add `telephone` (WhatsApp number) for Google business rich results
- Add individual product `Product` schemas (separate from LocalBusiness offers) for product-level search indexing
- Add `keywords` meta tag with shop category terms

`**supabase/functions/generate-sitemap/index.ts**` -- Improve sitemap:

- Add `<image:image>` tags for shop logos and product images (helps Google Images)
- Add feature pages (/features/growth, /features/payments, etc.) to static pages list

---

## 2. Paystack Fee Pass-through (Add Fees to Customer Amount)

### Problem

Paystack charges 1.5% + NGN 100 per transaction (capped at NGN 2,000). Currently, this comes out of the shop owner's money.

### Paystack Fee Formula

```
fee = (amount * 0.015) + 10000 (in kobo)
if fee > 200000: fee = 200000 (cap at NGN 2,000)
total_with_fee = amount + fee
```

### Changes

`**src/components/CheckoutDialog.tsx**`:

- Add a `calculatePaystackFee(amountInNaira)` utility function
- When "Pay Before Service" with Paystack is selected, show the fee breakdown:
  - Subtotal: NGN X
  - Processing fee: NGN Y
  - Total: NGN Z
- Pass the total (amount + fee) to `paystack-initialize-order`
- Store the original order amount in the `orders` table but charge the customer amount + fee

`**supabase/functions/paystack-initialize-order/index.ts**`:

- Receive the full amount (already includes fee from frontend)
- No changes needed on the backend since frontend will send the correct total

`**supabase/functions/done-for-you-initialize/index.ts**`:

- Add Paystack fee to the NGN 5,000 DFY price:
  - Fee: (5000 * 0.015) + 100 = NGN 175
  - Total: NGN 5,175 (517500 kobo)
- Update the amount sent to Paystack

`**src/components/DoneForYouPopup.tsx**`:

- Update display text to show: "Pay NGN 5,175 (NGN 5,000 + NGN 175 processing fee)"

**Subscription payment** (`supabase/functions/paystack-initialize/index.ts`):

- Apply same fee calculation to subscription amounts before sending to Paystack
- Show fee breakdown on the subscription payment page

---

## 3. DFY: Collect Products Before Generating Store

### Current Flow

1. User enters business name, WhatsApp, category
2. User pays NGN 5,000
3. Redirect back, AI creates shop
4. User then adds products one by one (post-creation)

### New Flow

1. User enters business name, WhatsApp, category
2. User adds 1-5 products (name, price, type, optional image) -- BEFORE payment
3. User pays NGN 5,175 (with fee)
4. Redirect back: AI creates shop AND all products in one batch
5. User sees completed store with all products ready

### Changes

`**src/components/DoneForYouPopup.tsx**`:

- Restructure steps: "intro" -> "products" -> "creating" -> "complete"
- After entering business details, show the product collection form (currently Step 3, move to Step 2)
- Store product data in localStorage alongside business details before payment redirect
- After payment verification, send all products to the backend in one call

`**supabase/functions/done-for-you-setup/index.ts**`:

- Accept a `products` array in the request body
- After creating the shop, batch-create all products with AI-generated descriptions
- Single API call creates everything: shop + all products

---

## 4. Update Homepage Subscription Plans Section

### Problem

The current `DynamicPricing` component on the homepage shows a basic card grid with limited features (max 6 shown). It doesn't show yearly pricing toggle, doesn't highlight all the premium features of Pro/Business plans, and doesn't match the full `SubscriptionCard` component used on `/subscription`.

### Changes

`**src/components/DynamicPricing.tsx**` -- Full upgrade:

- Add monthly/yearly billing toggle (like `SubscriptionCard`)
- Show yearly savings badge
- Show ALL features per plan (not truncated to 6)
- Add plan-specific icons (Zap for Basic, Sparkles for Pro, Crown for Business)
- Add the extra features from the database: Business Profile setup, Google My Business, SEO, Organic Marketing
- Show "per day" cost beneath price for psychological anchoring
- Add comparison highlights:
  - Basic: "Perfect for getting started"
  - Pro: "Most Popular" badge + "Includes DFY Business Profile"
  - Business: "Best Value" badge + "Full Marketing Suite"
- Add "All plans include: 15-day free trial, WhatsApp integration, Paystack payments" footer

---

## Technical Summary


| File                                                  | Change                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| `index.html`                                          | Expand meta keywords with 15+ high-converting search terms                        |
| `src/components/SEOSchemas.tsx`                       | Add BreadcrumbList, expand FAQ, add alternateName array, knowsAbout               |
| `supabase/functions/shop-og-meta/index.ts`            | Add address, telephone, product schemas to shop JSON-LD                           |
| `supabase/functions/generate-sitemap/index.ts`        | Add image tags, feature pages                                                     |
| `src/components/CheckoutDialog.tsx`                   | Add Paystack fee calculator, show fee breakdown, charge customer total+fee        |
| `supabase/functions/done-for-you-initialize/index.ts` | Update DFY amount to include Paystack fee                                         |
| `supabase/functions/done-for-you-setup/index.ts`      | Accept and batch-create products array                                            |
| `src/components/DoneForYouPopup.tsx`                  | Restructure flow: collect products before payment, store in localStorage          |
| `src/components/DynamicPricing.tsx`                   | Full upgrade with billing toggle, all features, plan icons, comparison highlights |
