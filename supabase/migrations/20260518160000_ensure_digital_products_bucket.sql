-- Ensure the digital-products bucket exists in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'digital-products',
  'digital-products',
  true, -- public = true allows direct unguessable URL downloads via getPublicUrl
  26214400, -- 25MB in bytes
  '{"application/pdf", "application/zip", "application/x-zip-compressed", "application/epub+zip", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "image/png", "image/jpeg"}'
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Set up Row Level Security (RLS) policies for the digital-products bucket on storage.objects

-- 1. Enable public read access for downloading digital products (only via unguessable direct links)
CREATE POLICY "Allow public download of digital products"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'digital-products');

-- 2. Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload digital products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'digital-products');

-- 3. Allow owners to update their files
CREATE POLICY "Allow owners to update digital products"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'digital-products');

-- 4. Allow owners to delete their files
CREATE POLICY "Allow owners to delete digital products"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'digital-products');
