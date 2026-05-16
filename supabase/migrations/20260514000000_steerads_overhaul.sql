-- Add traffic counters to shops table
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS contact_count integer DEFAULT 0;

-- Update subscription plans for SteerAds bundling
UPDATE public.subscription_plans 
SET 
  description = 'Everything you need to start selling with Daily Promotion included.',
  features = '["Up to 50 products", "Daily SteerAds Promotion (Starter)", "Advanced analytics", "AI Shop Assistant", "Priority support"]',
  max_products = 50
WHERE slug = 'pro';

UPDATE public.subscription_plans 
SET 
  description = 'Managed growth for established brands scaling in Nigeria.',
  features = '["Unlimited products", "Managed SteerAds Campaigns", "SEO Optimization & GMB", "Full analytics suite", "Custom domain"]',
  max_products = null
WHERE slug = 'business';

UPDATE public.subscription_plans 
SET 
  description = 'Launch your store and start building trust today.',
  features = '["Up to 5 products", "Basic analytics", "WhatsApp support", "Bank transfer payments"]',
  max_products = 5
WHERE slug = 'basic';

-- RPC functions for atomic increments
CREATE OR REPLACE FUNCTION public.increment_shop_view_count(shop_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.shops
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = shop_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_shop_contact_count(shop_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.shops
  SET contact_count = COALESCE(contact_count, 0) + 1
  WHERE id = shop_id;
END;
$$;
