-- Add video_url column to products table
ALTER TABLE public.products
ADD COLUMN video_url text DEFAULT NULL;

COMMENT ON COLUMN public.products.video_url IS 'URL for product video (alternative to image)';

-- Create product-videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-videos',
  'product-videos', 
  true,
  20971520,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']::text[]
);

-- RLS Policy: Shop owners can upload product videos
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

-- RLS Policy: Public read access for product videos
CREATE POLICY "Anyone can view product videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-videos');

-- RLS Policy: Shop owners can delete their product videos
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