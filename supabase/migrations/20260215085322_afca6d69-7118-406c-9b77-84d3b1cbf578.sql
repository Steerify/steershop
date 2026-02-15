
-- Add setup_preference column to onboarding_responses
ALTER TABLE public.onboarding_responses 
ADD COLUMN IF NOT EXISTS setup_preference text DEFAULT NULL;

-- Fix handle_new_user trigger to properly TRIM full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role text;
  safe_role user_role;
  safe_app_role app_role;
  trial_end timestamp with time zone;
  is_google_signup boolean;
  user_full_name text;
BEGIN
  requested_role := new.raw_user_meta_data->>'role';
  is_google_signup := (requested_role IS NULL OR requested_role = '');
  
  -- Get full_name, TRIM it, fallback to email prefix
  user_full_name := TRIM(new.raw_user_meta_data->>'full_name');
  IF user_full_name IS NULL OR user_full_name = '' THEN
    user_full_name := split_part(new.email, '@', 1);
  END IF;

  IF requested_role = 'shop_owner' THEN
    safe_role := 'shop_owner'::user_role;
    safe_app_role := 'shop_owner'::app_role;
    trial_end := now() + interval '15 days';
  ELSE
    safe_role := 'customer'::user_role;
    safe_app_role := 'customer'::app_role;
    trial_end := NULL;
  END IF;
  
  INSERT INTO public.profiles (id, email, full_name, role, subscription_expires_at, needs_role_selection)
  VALUES (
    new.id,
    new.email,
    user_full_name,
    safe_role,
    trial_end,
    is_google_signup
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, safe_app_role);
  
  RETURN new;
END;
$function$;
