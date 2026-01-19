-- 1. Fix shops_public view - remove sensitive financial data fields
DROP VIEW IF EXISTS public.shops_public;

CREATE OR REPLACE VIEW public.shops_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  shop_name,
  shop_slug,
  description,
  logo_url,
  banner_url,
  average_rating,
  total_reviews,
  is_active,
  is_verified,
  whatsapp_number,
  payment_method,
  paystack_public_key,
  created_at,
  updated_at
FROM public.shops
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.shops_public TO anon, authenticated;

-- 2. Remove policy that exposes shop owner profiles publicly
DROP POLICY IF EXISTS "Public can view limited profile data for shop owners" ON public.profiles;