-- Fix security definer view issue by using RLS on the base table instead
-- Drop and recreate view without security definer (views inherit caller's permissions by default)
DROP VIEW IF EXISTS public.shops_public;

CREATE OR REPLACE VIEW public.shops_public 
WITH (security_invoker = true)
AS
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