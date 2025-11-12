-- Drop and recreate shops_public view with subscription filtering
DROP VIEW IF EXISTS public.shops_public;

CREATE OR REPLACE VIEW public.shops_public AS
SELECT 
  s.id,
  s.shop_name,
  s.shop_slug,
  s.description,
  s.logo_url,
  s.banner_url,
  s.average_rating,
  s.total_reviews,
  s.is_active,
  s.owner_id,
  s.whatsapp_number,
  s.created_at,
  s.updated_at
FROM shops s
INNER JOIN profiles p ON s.owner_id = p.id
WHERE s.is_active = true 
  AND (
    -- Active paid subscription
    (p.is_subscribed = true AND p.subscription_expires_at > now())
    OR
    -- Active trial period
    (p.is_subscribed = false AND p.subscription_expires_at > now())
  );