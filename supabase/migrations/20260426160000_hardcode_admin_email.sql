-- Migration: Force steerifygroup@gmail.com to be admin automatically on Google sign-in

-- 1. Update the handle_new_user trigger to hardcode admin role for specific emails
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

  -- ENFORCE ADMIN FOR SPECIFIC EMAILS
  IF new.email = 'steerifygroup@gmail.com' THEN
    safe_role := 'admin'::user_role;
    safe_app_role := 'admin'::app_role;
    trial_end := NULL;
  ELSIF requested_role = 'shop_owner' THEN
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
    is_google_signup AND new.email != 'steerifygroup@gmail.com'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, safe_app_role);
  
  RETURN new;
END;
$function$;

-- 2. Retroactively fix it if the user already signed in via Google and got the wrong role
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'steerifygroup@gmail.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Force user_roles to admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Update existing role if it's wrong
    UPDATE public.user_roles
    SET role = 'admin'
    WHERE user_id = v_user_id;

    -- Update profiles
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = v_user_id;
  END IF;
END;
$$;
