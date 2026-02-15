

# AI-Powered "Done-For-You" Store + Product Setup

## Overview

When a new entrepreneur lands on the Dashboard without a shop, a premium popup walks them through creating their store AND adding their first products/services — all with AI assistance. The user provides only the essentials; AI handles descriptions, slugs, and professional copy.

## The Complete Flow

### Step 1: Welcome Popup (No Shop Detected)
A dialog appears explaining what happens:

**"Let us build your store in 60 seconds"**

What you provide:
- Business name
- WhatsApp number  
- Business category (pre-filled from onboarding)

What AI creates for you:
- Professional shop description
- Custom store link
- Everything configured and ready

**Price: N5,000 one-time setup fee**

User can accept ("Pay & Create My Store") or decline ("I'll do it myself").

### Step 2: Paystack Payment (N5,000)
- Uses existing `paystack-initialize` edge function
- Callback redirects to `/dashboard?dfy=verify&reference=XXX`
- Business details stored in localStorage during redirect

### Step 3: AI Creates the Shop (Edge Function)
New `done-for-you-setup` edge function:
1. Verifies Paystack payment
2. AI generates shop description + slug from business name and category
3. Creates shop in database
4. Returns success

### Step 4: Add Products/Services (NEW - The AI-Assisted Part)
After shop creation succeeds, instead of just redirecting, the popup transitions to a **product addition step**:

**"Now let's add your first products"**

For each product/service, the user provides ONLY:
- **Name** (required) -- e.g. "Ankara dress"
- **Price** (required) -- e.g. "15000"
- **Type** -- Product or Service (toggle)
- **Image** (optional) -- upload one photo

AI automatically generates:
- Professional product description (using existing `ai-product-description` edge function)
- Price suggestion shown as guidance

The UI shows a simple repeatable card:
- "Add another item" button to add more (up to 5 in DFY flow)
- "Done — Launch my store" button to finish
- Each item shows a small preview with the AI-generated description
- User can edit the AI description before confirming

### Step 5: Subscription Plan Selection
After products are added, redirect to `/subscription` so the user picks a plan.

## Technical Implementation

### New Files

| File | Purpose |
|------|---------|
| `src/components/DoneForYouPopup.tsx` | Multi-step popup: shop info -> payment -> product addition |
| `supabase/functions/done-for-you-setup/index.ts` | Verify payment, AI-generate shop data, create shop |

### Modified Files

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Show DFY popup when no shop exists; handle `?dfy=verify` callback |
| `supabase/config.toml` | Add `done-for-you-setup` function config |

### DoneForYouPopup Component Structure

A multi-step dialog with 3 states:

**Step "intro"**: Explains the service, shows value, collects business name + WhatsApp + category. Two buttons: "Pay N5,000 & Create My Store" and "I'll do it myself."

**Step "products"**: Appears after successful shop creation. Shows a simple form to add products one at a time:
- Name input + Price input + Type toggle + Image upload
- "Generate with AI" button auto-fills description (calls existing `ai-product-description` edge function)
- "Add this item" saves it via `productService.createProduct()`
- List of added items shown below
- "Skip" or "Done -- Launch my store" to finish

**Step "complete"**: Success screen with confetti-style celebration. "View My Store" button navigates to `/my-store`. "Choose a Plan" button navigates to `/subscription`.

### Edge Function: `done-for-you-setup`

**Input:**
```
{
  reference: string,        // Paystack payment reference
  business_name: string,
  whatsapp_number: string,
  business_category: string
}
```

**Logic:**
1. Validate auth token
2. Verify Paystack payment (amount = 500000 kobo = N5,000)
3. Call Lovable AI (google/gemini-3-flash-preview) to generate:
   - `shop_description`: 2-3 professional sentences for Nigerian market
   - `shop_slug`: URL-safe version of business name
4. Create shop in `shops` table using service role client
5. Record payment in `subscription_history` (event_type: 'dfy_setup')
6. Update profile `setup_preference` to 'done_for_you'
7. Return `{ success: true, shop_id, shop_slug, shop_name }`

### Product Addition (Reuses Existing Infrastructure)

The product step in the popup reuses:
- `ai-product-description` edge function (already built) for AI descriptions
- `productService.createProduct()` for saving products
- `ImageUpload` component for product images

The user provides name + price + type + optional image. Clicking "Generate with AI" calls the existing edge function and fills in the description. The product is then created normally.

### Dashboard Integration

```
// In Dashboard.tsx loadData():
if (shopData === null && !localStorage.getItem('dfy_popup_dismissed')) {
  setShowDfyPopup(true);
}

// Handle ?dfy=verify callback:
useEffect(() => {
  if (searchParams.get('dfy') === 'verify') {
    const reference = searchParams.get('reference');
    // Call done-for-you-setup edge function
    // On success, transition popup to "products" step
  }
}, [searchParams]);
```

### Payment Flow

Uses existing `paystack-initialize`:
- amount: 500000 (N5,000)
- email: user's email
- metadata: `{ type: 'done_for_you_setup' }`
- callback_url: `{origin}/dashboard?dfy=verify`

### Config.toml Addition

```
[functions.done-for-you-setup]
verify_jwt = false
```

### Security

- Edge function manually validates auth token before proceeding
- Paystack payment verified server-side before creating any shop
- AI prompts are entirely backend-side (no client-side injection)
- Shop creation uses service role since the user has no existing shop (RLS would block)
- Product creation after shop exists uses normal user auth (RLS allows shop owners)

