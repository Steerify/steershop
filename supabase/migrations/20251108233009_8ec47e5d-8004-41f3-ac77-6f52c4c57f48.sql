-- Fix security definer issue by explicitly setting SECURITY INVOKER
CREATE OR REPLACE VIEW public.shops_public
WITH (security_invoker = true) AS
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
  owner_id,
  whatsapp_number,
  created_at,
  updated_at
FROM public.shops
WHERE is_active = true;