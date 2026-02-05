
# Add Video Upload Support for Products

## Overview
Enable shop owners to upload either an **image OR a short video** for their products. The video will play in a loop on the storefront and product details page.

---

## Database Changes

### Add video_url column to products table

```sql
ALTER TABLE public.products
ADD COLUMN video_url text DEFAULT NULL;

COMMENT ON COLUMN public.products.video_url IS 'URL for product video (alternative to image)';
```

---

## Storage Bucket

### Create product-videos bucket

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-videos',
  'product-videos', 
  true,
  20971520,  -- 20MB max
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']::text[]
);

-- RLS Policy: Shop owners can upload to their shop folder
CREATE POLICY "Shop owners can upload product videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-videos' AND
  EXISTS (
    SELECT 1 FROM shops
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
);

-- RLS Policy: Public read access
CREATE POLICY "Anyone can view product videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-videos');

-- RLS Policy: Shop owners can delete their videos
CREATE POLICY "Shop owners can delete product videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-videos' AND
  EXISTS (
    SELECT 1 FROM shops
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
);
```

---

## New Component: MediaUpload

Create `src/components/MediaUpload.tsx` that allows choosing between:
- **Image** (existing functionality)
- **Video** (new, with loop preview)

### Features:
- Radio toggle: "Upload Image" vs "Upload Video"
- Video accepts: MP4, WebM, MOV
- Video max size: 20MB (configurable)
- Video preview plays in loop, muted
- Compression info shown for large files
- Reuses existing upload service patterns

### UI Layout:
```text
┌──────────────────────────────────────────────────────────┐
│  ○ Image   ● Video                                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │        [Video playing in loop / Image preview]    │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [📹 Record Video]  [📁 Choose File]                     │
│                                                          │
│  MP4, WebM or MOV (max. 20MB)                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Upload Service Updates

### Update `src/services/upload.service.ts`

Add video upload function:

```typescript
uploadVideo: async (
  file: File,
  folder: 'product-videos' = 'product-videos',
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  // Validate file size (20MB max for videos)
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Video size must be less than 20MB');
  }

  // Validate file type
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid video type. Please upload MP4, WebM, or MOV.');
  }

  // ... upload logic similar to uploadImage
}
```

---

## Product Form Updates

### Update `src/pages/Products.tsx`

1. Add state for media type selection:
```typescript
const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
const [videoUrl, setVideoUrl] = useState<string>("");
```

2. Replace `ImageUpload` with new `MediaUpload` component in the dialog

3. Update form submission to save either `image_url` or `video_url`:
```typescript
const productData = {
  // ... existing fields
  images: mediaType === 'image' && imageUrl ? [{ url: imageUrl }] : [],
  video_url: mediaType === 'video' ? videoUrl : null,
};
```

---

## Product Service Updates

### Update `src/services/product.service.ts`

1. Add `video_url` to the insert/update operations:
```typescript
video_url: data.video_url || null,
```

2. Add `video_url` to the mapped Product type:
```typescript
video_url: p.video_url || undefined,
```

---

## Storefront Display Updates

### Update `src/pages/ShopStorefront.tsx`

Replace static image with conditional image/video:

```typescript
{product.video_url ? (
  <video
    src={product.video_url}
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  />
) : product.image_url ? (
  <img
    src={product.image_url}
    alt={product.name}
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  />
) : (
  // Default placeholder
)}
```

### Update `src/pages/ProductDetails.tsx`

Similar video/image conditional for the main product display.

---

## Type Updates

### Update `src/types/api.ts`

Add `video_url` to Product interface:
```typescript
export interface Product {
  // ... existing fields
  video_url?: string;
}
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database Migration | Create | Add `video_url` column + storage bucket |
| `src/components/MediaUpload.tsx` | Create | New component for image/video selection |
| `src/services/upload.service.ts` | Modify | Add `uploadVideo` function |
| `src/hooks/useFileUpload.ts` | Modify | Support video uploads |
| `src/pages/Products.tsx` | Modify | Use MediaUpload, handle video state |
| `src/services/product.service.ts` | Modify | Include video_url in CRUD |
| `src/types/api.ts` | Modify | Add video_url to Product type |
| `src/pages/ShopStorefront.tsx` | Modify | Display video with loop |
| `src/pages/ProductDetails.tsx` | Modify | Display video with loop |
| `src/pages/admin/AdminProducts.tsx` | Modify | Show video preview in admin table |

---

## Technical Considerations

### Video Compression
Browser-based video compression is complex and resource-intensive. Instead of client-side compression:
- Set a strict 20MB limit
- Recommend users use shorter clips (< 30 seconds)
- Consider adding server-side transcoding later via Edge Function

### Mobile Recording
The `capture="environment"` attribute works for video on mobile:
```html
<input type="file" accept="video/*" capture="environment" />
```

### Autoplay Requirements
Videos must be **muted** to autoplay on most browsers:
```html
<video autoPlay loop muted playsInline />
```

### Performance
- Videos are lazier to load than images
- Consider adding `poster` attribute for first-frame preview
- Intersection Observer for lazy loading videos off-screen (future enhancement)

---

## User Flow

```text
Shop Owner → Products Page → Add New Product
                                    ↓
                           ○ Image  ● Video
                                    ↓
                    [Record Video] or [Choose File]
                                    ↓
                         Video preview (looping)
                                    ↓
                              Save Product
                                    ↓
                 Storefront shows video playing in loop
```

---

## Summary

This implementation allows shop owners to showcase products with short looping videos instead of static images, making storefronts more engaging and dynamic. The video plays silently in a loop, similar to how Instagram and TikTok preview videos.
