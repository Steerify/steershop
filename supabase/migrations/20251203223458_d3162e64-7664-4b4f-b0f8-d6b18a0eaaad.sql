-- Update shops_public view to include payment fields needed for checkout
CREATE OR REPLACE VIEW public.shops_public AS
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
  updated_at,
  payment_method,
  paystack_public_key
FROM public.shops;