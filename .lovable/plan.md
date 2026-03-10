

# Plan: Fix DoneForYou Product Upload & Free Setup Flow

## Problems Found

1. **Image upload error (your screenshot)**: The `ImageUpload` component in the DoneForYouPopup tries to upload images to storage immediately (`autoUpload=true`). The upload service requires a shop to exist (to determine the storage path), but the shop hasn't been created yet at this point.

2. **Free setup is broken**: The edge function `done-for-you-setup` always verifies Paystack payment (lines 53-72). When `handleFreeCreate` sends `reference: "free_setup"`, the Paystack verification fails because "free_setup" isn't a real transaction reference. So free shop creation (5 products or fewer) doesn't work at all.

3. **Edge function sets `is_active: true`** (line 162): This bypasses the new admin approval workflow we just implemented.

## Changes

### 1. `src/components/DoneForYouPopup.tsx` — Store images locally, upload after shop creation
- Set `autoUpload={false}` on `ImageUpload` so it only shows a local preview without uploading to storage.
- Store `File` objects alongside draft products (add a `file` field to `DraftProduct`).
- After the edge function creates the shop and products, upload images client-side using the returned `shop_id`, then update each product's `image_url` in the database.
- This eliminates the "create shop first" error entirely.

### 2. `supabase/functions/done-for-you-setup/index.ts` — Support free setup path
- Check for the `free_setup: true` flag in the request body.
- When `free_setup` is true, skip Paystack payment verification entirely (no charge for 5 or fewer products).
- Set `is_active: false` on the created shop to maintain the admin approval workflow.
- Skip the `subscription_history` insert for free setups.

### 3. `src/components/DoneForYouPopup.tsx` — Post-creation image upload logic
- After `handleFreeCreate` or `handleVerifyPayment` succeeds, iterate over draft products that have a `File` attached.
- Upload each file to `product-images/{shop_id}/` via the upload service.
- Update the corresponding product records with the returned public URLs.
- Show "Uploading images..." status during this phase.

### 4. `src/components/ImageUpload.tsx` — Ensure `autoUpload={false}` returns File to parent
- The component already supports `autoUpload={false}` with `onFileSelect` callback. No changes needed here — just need to wire it up in DoneForYouPopup.

## Flow After Fix

```text
User fills business info → Adds products with local preview images
  → Clicks "Create My Store — Free!" (≤5 products)
    → Edge function creates shop + products (no payment check)
    → Client uploads images to storage using new shop_id  
    → Updates product image_urls
    → Shows completion screen

  → Clicks "Pay & Create" (>5 products)  
    → Paystack payment → Edge function verifies + creates
    → Same client-side image upload after
```

