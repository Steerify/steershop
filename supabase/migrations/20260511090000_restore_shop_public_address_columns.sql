-- Restore optional shop location columns used by the store setup and storefront.
-- Street address is only displayed publicly when show_public_address is true.
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS show_public_address BOOLEAN NOT NULL DEFAULT false;
