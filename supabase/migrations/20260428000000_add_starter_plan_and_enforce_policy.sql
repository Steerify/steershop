-- Migration: 20260428000000_add_starter_plan_and_enforce_policy
-- Ensure 'Starter' plan exists
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, features, max_products, ai_features_enabled, priority_support, display_order)
VALUES (
  'Starter', 
  'starter', 
  'Perfect for testing the waters', 
  0, 
  0, 
  '["Up to 5 products", "Basic analytics", "WhatsApp support"]', 
  5, 
  false, 
  false, 
  0
)
ON CONFLICT (slug) DO UPDATE SET
  max_products = 5,
  price_monthly = 0,
  features = '["Up to 5 products", "Basic analytics", "WhatsApp support"]';

-- Function to check subscription limits and deactivate shops if they don't comply
-- This function counts products for users whose subscription expired more than 3 days ago
-- and deactivates their shop if they have more than 5 products.
CREATE OR REPLACE FUNCTION public.enforce_subscription_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_user RECORD;
  user_product_count INTEGER;
BEGIN
  -- Find users whose subscription expired more than 3 days ago
  -- and who are NOT on the starter plan (since starter doesn't expire usually)
  -- Actually, the request says "if a shop owner was on free trial or paid subscription and it expires"
  -- So we check subscription_expires_at.
  
  FOR expired_user IN 
    SELECT p.id, p.email, p.full_name
    FROM public.profiles p
    WHERE p.role = 'shop_owner'
      AND p.subscription_expires_at IS NOT NULL
      AND p.subscription_expires_at < (NOW() - INTERVAL '3 days')
      AND EXISTS (
        SELECT 1 FROM public.shops s 
        WHERE s.owner_id = p.id AND s.is_active = true
      )
  LOOP
    -- Count products for this user's shop(s)
    SELECT COUNT(*) INTO user_product_count
    FROM public.products pr
    JOIN public.shops s ON pr.shop_id = s.id
    WHERE s.owner_id = expired_user.id AND pr.is_available = true;
    
    -- If product count > 5, deactivate the shop(s)
    IF user_product_count > 5 THEN
      UPDATE public.shops
      SET is_active = false,
          updated_at = NOW()
      WHERE owner_id = expired_user.id
        AND is_active = true;
        
      -- Log the action
      RAISE NOTICE 'Deactivated shops for user % due to expired subscription and high product count (%)', expired_user.email, user_product_count;
    END IF;
  END LOOP;
END;
$$;

-- Add a trigger to prevent manual reactivation of shops that are over the limit
CREATE OR REPLACE FUNCTION public.enforce_reactivation_limit()
RETURNS TRIGGER AS $$
DECLARE
  product_count INTEGER;
  sub_expires TIMESTAMPTZ;
BEGIN
  -- Only check when activating a shop
  IF NEW.is_active = true AND (OLD.is_active = false OR OLD.is_active IS NULL) THEN
    -- Check owner's subscription status
    SELECT subscription_expires_at INTO sub_expires
    FROM public.profiles
    WHERE id = NEW.owner_id;

    -- If subscription is expired (or missing)
    IF sub_expires IS NULL OR sub_expires < NOW() THEN
      -- Count products
      SELECT COUNT(*) INTO product_count
      FROM public.products
      WHERE shop_id = NEW.id AND is_available = true;

      -- If over the limit, block activation
      IF product_count > 5 THEN
        RAISE EXCEPTION 'Cannot activate shop with more than 5 products on an expired subscription. Please remove products first.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_enforce_reactivation_limit ON public.shops;
CREATE TRIGGER tr_enforce_reactivation_limit
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_reactivation_limit();
