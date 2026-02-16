
-- 1. Add category column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';

-- 2. Update check_shop_verification with realistic thresholds
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
BEGIN
  -- Get shop owner
  SELECT owner_id INTO shop_owner_id
  FROM public.shops
  WHERE id = shop_uuid;

  IF shop_owner_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if owner has bank verification
  SELECT COALESCE(bank_verified, false) INTO owner_bank_verified
  FROM public.profiles
  WHERE id = shop_owner_id;

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

  -- Verified if ALL conditions met:
  -- 1. Owner bank verified
  -- 2. At least 10 completed orders
  -- 3. Rating >= 3.5 OR no reviews yet (rating = 0 means no reviews)
  -- 4. Shop active for at least 7 days
  RETURN owner_bank_verified
    AND total_completed_orders >= 10
    AND (avg_rating >= 3.5 OR avg_rating = 0)
    AND shop_age_days >= 7;
END;
$function$;

-- 3. Update the batch verification function
CREATE OR REPLACE FUNCTION public.update_all_shop_verifications()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.shops
  SET is_verified = public.check_shop_verification(id);
END;
$function$;

-- 4. Create trigger function to re-check verification on order status change
CREATE OR REPLACE FUNCTION public.recheck_shop_verification_on_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.shops
    SET is_verified = public.check_shop_verification(NEW.shop_id)
    WHERE id = NEW.shop_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 5. Create trigger function to re-check verification on review change
CREATE OR REPLACE FUNCTION public.recheck_shop_verification_on_review()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.shops
  SET is_verified = public.check_shop_verification(COALESCE(NEW.shop_id, OLD.shop_id))
  WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 6. Create triggers
CREATE TRIGGER trg_recheck_verification_on_order
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.recheck_shop_verification_on_order();

CREATE TRIGGER trg_recheck_verification_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.recheck_shop_verification_on_review();
