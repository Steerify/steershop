
-- Add NAFDAC number field to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS nafdac_number TEXT DEFAULT NULL;

-- Create SafeBeauty tiers table for tracking vendor badge progression
CREATE TABLE IF NOT EXISTS public.safebeauty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'listed' CHECK (tier IN ('listed', 'checked', 'trusted', 'verified', 'approved')),
  nafdac_products_count INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  days_active INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.safebeauty_tiers ENABLE ROW LEVEL SECURITY;

-- Anyone can read SafeBeauty tiers (public trust signal)
CREATE POLICY "Anyone can view SafeBeauty tiers" ON public.safebeauty_tiers
  FOR SELECT TO anon, authenticated USING (true);

-- Shop owners can view their own tier
CREATE POLICY "Shop owners can view own tier" ON public.safebeauty_tiers
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = safebeauty_tiers.shop_id AND shops.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = safebeauty_tiers.shop_id AND shops.owner_id = auth.uid())
  );

-- Function to calculate SafeBeauty tier for a shop
CREATE OR REPLACE FUNCTION public.calculate_safebeauty_tier(shop_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_nafdac_count INTEGER;
  v_total_orders INTEGER;
  v_total_reviews INTEGER;
  v_avg_rating NUMERIC;
  v_days_active INTEGER;
  v_is_verified BOOLEAN;
  v_tier TEXT;
BEGIN
  -- Count products with NAFDAC numbers
  SELECT COUNT(*) INTO v_nafdac_count
  FROM products WHERE shop_id = shop_uuid AND nafdac_number IS NOT NULL AND nafdac_number != '';

  -- Count completed orders
  SELECT COUNT(*) INTO v_total_orders
  FROM orders WHERE shop_id = shop_uuid AND status = 'completed';

  -- Get review stats
  SELECT COALESCE(average_rating, 0), COALESCE(total_reviews, 0), COALESCE(is_verified, false)
  INTO v_avg_rating, v_total_reviews, v_is_verified
  FROM shops WHERE id = shop_uuid;

  -- Shop age
  SELECT EXTRACT(DAY FROM (NOW() - created_at))::INTEGER INTO v_days_active
  FROM shops WHERE id = shop_uuid;

  -- Tier calculation (progressive)
  -- Approved: Verified shop + 50+ orders + 4.5+ rating + NAFDAC products
  IF v_is_verified AND v_total_orders >= 50 AND v_avg_rating >= 4.5 AND v_nafdac_count >= 3 THEN
    v_tier := 'approved';
  -- Verified: Verified shop + 25+ orders + 4.0+ rating
  ELSIF v_is_verified AND v_total_orders >= 25 AND v_avg_rating >= 4.0 THEN
    v_tier := 'verified';
  -- Trusted: 10+ orders + 3.5+ rating + 30+ days
  ELSIF v_total_orders >= 10 AND v_avg_rating >= 3.5 AND v_days_active >= 30 THEN
    v_tier := 'trusted';
  -- Checked: 3+ orders + any rating + 7+ days
  ELSIF v_total_orders >= 3 AND v_days_active >= 7 THEN
    v_tier := 'checked';
  -- Listed: default for all active shops
  ELSE
    v_tier := 'listed';
  END IF;

  -- Upsert the tier record
  INSERT INTO safebeauty_tiers (shop_id, tier, nafdac_products_count, total_orders, total_reviews, average_rating, days_active, last_calculated_at, updated_at)
  VALUES (shop_uuid, v_tier, v_nafdac_count, v_total_orders, v_total_reviews, v_avg_rating, COALESCE(v_days_active, 0), now(), now())
  ON CONFLICT (shop_id)
  DO UPDATE SET
    tier = v_tier,
    nafdac_products_count = v_nafdac_count,
    total_orders = v_total_orders,
    total_reviews = v_total_reviews,
    average_rating = v_avg_rating,
    days_active = COALESCE(v_days_active, 0),
    last_calculated_at = now(),
    updated_at = now();

  RETURN v_tier;
END;
$$;
