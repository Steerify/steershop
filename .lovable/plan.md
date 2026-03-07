

# Plan: Fix Video Upload + Show Pre-existing Videos

## Root Causes

1. **Upload path mismatch**: `VideoUpload.tsx` uploads to `videos/${fileName}`, but the RLS INSERT policy requires the first folder to be the **shop ID** (`(storage.foldername(name))[1] = shop_id`). Every upload fails with an RLS violation.

2. **Bucket file size limit**: Currently set to ~20MB (`20971520`), but we want 50MB.

## Changes

### 1. Database migration — increase bucket size limit
```sql
UPDATE storage.buckets SET file_size_limit = 52428800 WHERE id = 'product-videos';
```

### 2. `src/components/VideoUpload.tsx` — accept `shopId` prop, fix upload path
- Add optional `shopId?: string` prop
- If not provided, fetch user's shop ID from Supabase as fallback
- Change upload path from `videos/${fileName}` → `${shopId}/${fileName}` to satisfy the RLS policy

### 3. `src/pages/Products.tsx` — pass `shopId` to VideoUpload
- Add `shopId={shop.id}` to the `<VideoUpload>` component (shop is already in state)

### Pre-existing videos
The one existing video (`content creation tutorial`) is already stored under a shop-ID path and has a valid public URL. It will continue to display correctly — no migration needed.

