-- Add safe, shop-level searchable metadata for marketplace discovery.
-- Keep full street addresses out of public.shops; address data belongs in private fulfilment/address tables.
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS city text;

CREATE OR REPLACE VIEW public.shops_public AS
SELECT id, owner_id, shop_name, shop_slug, description, logo_url, banner_url,
       is_active, average_rating, total_reviews, whatsapp_number, is_verified,
       primary_color, secondary_color, accent_color, theme_mode, font_style,
       country, state, created_at, updated_at, payment_method, category, city
FROM public.shops
WHERE is_active = true;

ALTER VIEW public.shops_public SET (security_invoker = on);
GRANT SELECT ON public.shops_public TO anon, authenticated;
