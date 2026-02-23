CREATE OR REPLACE FUNCTION public.check_product_limit(_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Default to Basic limit if no plan found at all
  IF plan_slug IS NULL THEN
    max_allowed := 20;
    plan_slug := 'basic';
  END IF;
  
  -- Count current products for user's shop
  SELECT COUNT(*) INTO current_count
  FROM products pr
  JOIN shops s ON pr.shop_id = s.id
  WHERE s.owner_id = _user_id AND pr.is_available = true;
  
  -- NULL max_allowed means unlimited (Business plan)
  RETURN json_build_object(
    'can_create', CASE WHEN max_allowed IS NULL THEN true ELSE current_count < max_allowed END,
    'current_count', current_count,
    'max_allowed', COALESCE(max_allowed, -1),
    'plan_slug', plan_slug
  );
END;
$function$;