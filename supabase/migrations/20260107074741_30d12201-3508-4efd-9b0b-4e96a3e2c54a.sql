-- Fix subscription storage and enforce plan limits

-- Step 1: Assign Basic plan to subscribed users with null subscription_plan_id
UPDATE profiles
SET subscription_plan_id = (
  SELECT id FROM subscription_plans WHERE slug = 'basic' LIMIT 1
)
WHERE is_subscribed = true 
  AND subscription_plan_id IS NULL
  AND subscription_expires_at > NOW();

-- Step 2: Create trigger to automatically set default plan on subscription
CREATE OR REPLACE FUNCTION public.set_default_subscription_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When user becomes subscribed but has no plan, assign Basic
  IF NEW.is_subscribed = true AND NEW.subscription_plan_id IS NULL THEN
    NEW.subscription_plan_id := (
      SELECT id FROM subscription_plans WHERE slug = 'basic' LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS ensure_subscription_plan ON profiles;

-- Create trigger
CREATE TRIGGER ensure_subscription_plan
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION public.set_default_subscription_plan();

-- Step 3: Update check_feature_usage to enforce plan-based AI access
CREATE OR REPLACE FUNCTION public.check_feature_usage(_user_id uuid, _feature_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_usage INTEGER;
  max_usage INTEGER;
  current_month TEXT;
  user_plan_slug TEXT;
  has_ai_features BOOLEAN;
  is_business BOOLEAN;
BEGIN
  current_month := to_char(NOW(), 'YYYY-MM');
  
  -- Get user's subscription plan and AI features status
  SELECT sp.slug, COALESCE(sp.ai_features_enabled, false) 
  INTO user_plan_slug, has_ai_features
  FROM profiles p
  LEFT JOIN subscription_plans sp ON p.subscription_plan_id = sp.id
  WHERE p.id = _user_id;
  
  is_business := COALESCE(user_plan_slug, '') = 'business';
  
  -- For AI features, check if plan allows it
  IF _feature_name = 'stroke_my_shop' OR _feature_name = 'know_this_shop' THEN
    -- Basic plan (or no plan) = no AI access
    IF NOT COALESCE(has_ai_features, false) THEN
      RETURN json_build_object(
        'can_use', false,
        'blocked_by_plan', true,
        'current_usage', 0,
        'max_usage', 0,
        'is_business', false,
        'plan_slug', COALESCE(user_plan_slug, 'free')
      );
    END IF;
    
    -- Business = unlimited
    IF is_business THEN
      max_usage := -1;
    -- Pro = 10/month
    ELSE
      max_usage := 10;
    END IF;
  ELSE
    max_usage := 10;
  END IF;
  
  -- Get current usage
  SELECT COALESCE(usage_count, 0) INTO current_usage
  FROM feature_usage
  WHERE user_id = _user_id 
    AND feature_name = _feature_name 
    AND month_year = current_month;
  
  current_usage := COALESCE(current_usage, 0);
  
  RETURN json_build_object(
    'can_use', CASE WHEN max_usage = -1 THEN true ELSE current_usage < max_usage END,
    'blocked_by_plan', false,
    'current_usage', current_usage,
    'max_usage', max_usage,
    'is_business', is_business,
    'plan_slug', COALESCE(user_plan_slug, 'free')
  );
END;
$$;

-- Step 4: Create check_product_limit function
CREATE OR REPLACE FUNCTION public.check_product_limit(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
  plan_slug TEXT;
BEGIN
  -- Get user's plan limits
  SELECT sp.max_products, sp.slug INTO max_allowed, plan_slug
  FROM profiles p
  LEFT JOIN subscription_plans sp ON p.subscription_plan_id = sp.id
  WHERE p.id = _user_id;
  
  -- Default to Basic limit if no plan (20 products)
  IF max_allowed IS NULL THEN
    max_allowed := 20;
    plan_slug := COALESCE(plan_slug, 'basic');
  END IF;
  
  -- Count current products for user's shop
  SELECT COUNT(*) INTO current_count
  FROM products pr
  JOIN shops s ON pr.shop_id = s.id
  WHERE s.owner_id = _user_id AND pr.is_available = true;
  
  RETURN json_build_object(
    'can_create', current_count < max_allowed,
    'current_count', current_count,
    'max_allowed', max_allowed,
    'plan_slug', plan_slug
  );
END;
$$;