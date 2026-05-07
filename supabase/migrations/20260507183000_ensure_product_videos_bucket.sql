-- Migration: Ensure product-videos bucket exists and is public
DO $$ 
BEGIN
    -- Create bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('product-videos', 'product-videos', true)
    ON CONFLICT (id) DO UPDATE SET public = true;

    -- Add policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public access to product-videos'
    ) THEN
        CREATE POLICY "Public access to product-videos" 
        ON storage.objects FOR SELECT 
        USING (bucket_id = 'product-videos');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload product-videos'
    ) THEN
        CREATE POLICY "Authenticated users can upload product-videos" 
        ON storage.objects FOR INSERT 
        TO authenticated 
        WITH CHECK (bucket_id = 'product-videos' AND auth.uid() = owner);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owners can update their product-videos'
    ) THEN
        CREATE POLICY "Owners can update their product-videos" 
        ON storage.objects FOR UPDATE 
        TO authenticated 
        USING (bucket_id = 'product-videos' AND auth.uid() = owner);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owners can delete their product-videos'
    ) THEN
        CREATE POLICY "Owners can delete their product-videos" 
        ON storage.objects FOR DELETE 
        TO authenticated 
        USING (bucket_id = 'product-videos' AND auth.uid() = owner);
    END IF;
END $$;
