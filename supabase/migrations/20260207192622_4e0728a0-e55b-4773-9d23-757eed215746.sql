
-- Create promoted_listings table
CREATE TABLE public.promoted_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  product_id uuid NULL REFERENCES public.products(id) ON DELETE SET NULL,
  listing_type text NOT NULL DEFAULT 'shop',
  amount_paid numeric NOT NULL,
  payment_ref text NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promoted_listings ENABLE ROW LEVEL SECURITY;

-- Shop owners can view their own promotions
CREATE POLICY "Shop owners can view own promotions"
ON public.promoted_listings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.shops WHERE shops.id = promoted_listings.shop_id AND shops.owner_id = auth.uid()
));

-- Shop owners can create promotions for their shop
CREATE POLICY "Shop owners can create promotions"
ON public.promoted_listings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.shops WHERE shops.id = promoted_listings.shop_id AND shops.owner_id = auth.uid()
));

-- Public can view active promotions (for display on shops page)
CREATE POLICY "Anyone can view active promotions"
ON public.promoted_listings FOR SELECT
USING (is_active = true AND expires_at > now());

-- Admins can manage all promotions
CREATE POLICY "Admins can manage all promotions"
ON public.promoted_listings FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
