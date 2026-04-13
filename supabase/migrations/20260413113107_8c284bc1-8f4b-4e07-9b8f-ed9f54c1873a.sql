
-- Drop existing view and recreate with safe columns only
DROP VIEW IF EXISTS public.shops_public CASCADE;

CREATE VIEW public.shops_public AS
SELECT id, owner_id, shop_name, shop_slug, description, logo_url, banner_url,
       is_active, average_rating, total_reviews, whatsapp_number, is_verified,
       primary_color, secondary_color, accent_color, theme_mode, font_style,
       country, state, created_at, updated_at, payment_method
FROM public.shops
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.shops_public TO anon, authenticated;

-- Fix mutable search path on email queue functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = 'public';
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = 'public';
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = 'public';
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = 'public';
