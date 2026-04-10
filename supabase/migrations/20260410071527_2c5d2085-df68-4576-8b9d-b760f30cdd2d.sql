-- 1. Fix PRIVILEGE ESCALATION: Remove dangerous user_roles policies
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can update their own role" ON public.user_roles;

-- Add safe service-role-only policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only service role can insert roles') THEN
    CREATE POLICY "Only service role can insert roles"
      ON public.user_roles FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only service role can update roles') THEN
    CREATE POLICY "Only service role can update roles"
      ON public.user_roles FOR UPDATE
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only service role can delete roles') THEN
    CREATE POLICY "Only service role can delete roles"
      ON public.user_roles FOR DELETE
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- 2. Add public read for feature phase settings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_settings' AND policyname = 'Anyone can read feature phase settings') THEN
    CREATE POLICY "Anyone can read feature phase settings"
      ON public.platform_settings FOR SELECT
      USING (key LIKE 'feature_phase_%');
  END IF;
END $$;

-- 3. Fix storage policies for product images
DROP POLICY IF EXISTS "Shop owners can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Shop owners can update product images" ON storage.objects;

CREATE POLICY "Shop owners can delete own product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.shops s
      WHERE s.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = s.id::text
    )
  );

CREATE POLICY "Shop owners can update own product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.shops s
      WHERE s.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = s.id::text
    )
  );
