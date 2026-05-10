-- Add public marketplace profile fields for shop discovery and SEO.
-- Street address remains private unless show_public_address is explicitly enabled.
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS show_public_address BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_shops_category ON public.shops(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shops_city ON public.shops(city) WHERE city IS NOT NULL;
