-- shops schema drift
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS show_public_address boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_keywords text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_dna_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS uses_own_logistics boolean DEFAULT false;

-- profiles schema drift
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS newsletter_subscription boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS shopping_interests text[] DEFAULT '{}'::text[];

-- products schema drift
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_digital boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS digital_file_url text,
  ADD COLUMN IF NOT EXISTS digital_delivery_text text;