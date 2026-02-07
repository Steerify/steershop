
-- Add missing columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_city TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_state TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create shop_payouts table for withdrawal/settlement tracking
CREATE TABLE public.shop_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reference TEXT,
  admin_notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can view own payouts"
ON public.shop_payouts FOR SELECT
USING (EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_payouts.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Shop owners can request payouts"
ON public.shop_payouts FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_payouts.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Admins can manage all payouts"
ON public.shop_payouts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create wishlists table
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlists"
ON public.wishlists FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create shop_coupons table
CREATE TABLE public.shop_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can manage own coupons"
ON public.shop_coupons FOR ALL
USING (EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_coupons.shop_id AND shops.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.id = shop_coupons.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Anyone can view active coupons for active shops"
ON public.shop_coupons FOR SELECT
USING (is_active = true);
