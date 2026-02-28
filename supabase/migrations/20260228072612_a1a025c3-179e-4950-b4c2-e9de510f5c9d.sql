
-- Update check_shop_verification to require paid subscription
CREATE OR REPLACE FUNCTION public.check_shop_verification(shop_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  owner_bank_verified boolean;
  total_completed_orders integer;
  avg_rating numeric;
  shop_age_days integer;
  shop_owner_id uuid;
  owner_is_subscribed boolean;
BEGIN
  -- Get shop owner
  SELECT owner_id INTO shop_owner_id
  FROM public.shops
  WHERE id = shop_uuid;

  IF shop_owner_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if owner has bank verification AND paid subscription
  SELECT COALESCE(bank_verified, false), COALESCE(is_subscribed, false) 
  INTO owner_bank_verified, owner_is_subscribed
  FROM public.profiles
  WHERE id = shop_owner_id;

  -- Must have active paid subscription
  IF NOT owner_is_subscribed THEN
    RETURN false;
  END IF;

  -- Count total completed orders
  SELECT COUNT(*) INTO total_completed_orders
  FROM public.orders
  WHERE shop_id = shop_uuid AND status = 'completed';

  -- Get average rating
  SELECT COALESCE(average_rating, 0) INTO avg_rating
  FROM public.shops
  WHERE id = shop_uuid;

  -- Get shop age in days
  SELECT EXTRACT(DAY FROM (NOW() - created_at))::integer INTO shop_age_days
  FROM public.shops
  WHERE id = shop_uuid;

  RETURN owner_bank_verified
    AND total_completed_orders >= 10
    AND (avg_rating >= 3.5 OR avg_rating = 0)
    AND shop_age_days >= 7;
END;
$function$;

-- Update set_default_subscription_plan to use 'growth' instead of 'basic'
CREATE OR REPLACE FUNCTION public.set_default_subscription_plan()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.is_subscribed = true AND NEW.subscription_plan_id IS NULL THEN
    NEW.subscription_plan_id := (
      SELECT id FROM subscription_plans WHERE slug = 'growth' LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$function$;
