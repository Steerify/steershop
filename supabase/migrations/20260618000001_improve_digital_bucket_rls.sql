
-- Improved RLS for digital-products bucket!
-- Ensure only shop owners can upload digital files to their own prefixes!
BEGIN;

-- First, drop existing policies to replace them!
DROP POLICY IF EXISTS "Allow public download of digital products" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload digital products" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to update digital products" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to delete digital products" ON storage.objects;

-- 1. Allow public downloads of digital products (unguessable URLs still!)
CREATE POLICY "Allow public download of digital products"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'digital-products');

-- 2. Allow authenticated users to upload ONLY to paths prefixed with their OWN SHOP ID!
CREATE POLICY "Allow shop owners to upload digital products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'digital-products'
  AND (
    -- Check that the path prefix is either their user id OR their shop id!
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM shops WHERE owner_id = auth.uid()
    )
    OR
    (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- 3. Allow updating their own digital files!
CREATE POLICY "Allow owners to update digital products"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'digital-products'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM shops WHERE owner_id = auth.uid()
    )
    OR
    (storage.foldername(name))[1] = auth.uid()::text
  )
);

--4. Allow deleting their own digital files!
CREATE POLICY "Allow owners to delete digital products"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'digital-products'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM shops WHERE owner_id = auth.uid()
    )
    OR
    (storage.foldername(name))[1] = auth.uid()::text
  )
);

COMMIT;
