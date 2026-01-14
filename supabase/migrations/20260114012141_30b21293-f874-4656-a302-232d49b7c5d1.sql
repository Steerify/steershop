-- Drop the existing view first
DROP VIEW IF EXISTS public.shops_public;

-- Recreate the view with bank transfer fields included
CREATE VIEW public.shops_public 
WITH (security_invoker = true) AS
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
  created_at,
  updated_at
FROM public.shops
WHERE is_active = true;

-- Ensure grants are in place
GRANT SELECT ON public.shops_public TO anon, authenticated;