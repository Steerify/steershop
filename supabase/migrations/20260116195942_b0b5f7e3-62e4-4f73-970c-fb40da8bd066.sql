-- Add is_verified column to shops table
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Create function to check if shop meets verification criteria
-- Verified = average_rating >= 4.0 AND daily_sales >= 40 (over last 30 days)
CREATE OR REPLACE FUNCTION public.check_shop_verification(shop_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating numeric;
  daily_sales numeric;
  total_completed_orders integer;
BEGIN
  -- Get average rating from shops table
  SELECT average_rating INTO avg_rating 
  FROM public.shops 
  WHERE id = shop_uuid;
  
  -- Calculate daily average of completed orders over last 30 days
  SELECT COUNT(*)
  INTO total_completed_orders
  FROM public.orders 
  WHERE shop_id = shop_uuid 
    AND status = 'completed'
    AND created_at >= NOW() - INTERVAL '30 days';
  
  daily_sales := total_completed_orders::numeric / 30;
  
  -- Verified if: rating >= 4.0 AND average 40+ completed orders per day
  RETURN (COALESCE(avg_rating, 0) >= 4.0) AND (daily_sales >= 40);
END;
$$;

-- Create function to update all shop verification statuses
CREATE OR REPLACE FUNCTION public.update_all_shop_verifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shops
  SET is_verified = public.check_shop_verification(id);
END;
$$;

-- Recreate shops_public view with is_verified field
DROP VIEW IF EXISTS public.shops_public;
CREATE VIEW public.shops_public AS
SELECT 
  id,
  owner_id,
  shop_name,
  shop_slug,
  description,
  logo_url,
  banner_url,
  average_rating,
  total_reviews,
  is_active,
  whatsapp_number,
  payment_method,
  paystack_public_key,
  bank_account_name,
  bank_name,
  bank_account_number,
  is_verified,
  created_at,
  updated_at
FROM public.shops
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.shops_public TO anon, authenticated;