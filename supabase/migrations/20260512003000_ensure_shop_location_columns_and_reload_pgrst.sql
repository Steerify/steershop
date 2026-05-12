-- Ensure store setup/location columns exist in production and refresh PostgREST.
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Nigeria',
  ADD COLUMN IF NOT EXISTS show_public_address boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_shops_category ON public.shops(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shops_city ON public.shops(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shops_state ON public.shops(state) WHERE state IS NOT NULL;

NOTIFY pgrst, 'reload schema';
