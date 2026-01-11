-- Update handle_new_user function to give 15-day trial instead of 7
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
  safe_role user_role;
  safe_app_role app_role;
  trial_end timestamp with time zone;
BEGIN
  -- Get the requested role from metadata
  requested_role := new.raw_user_meta_data->>'role';
  
  -- Only allow customer or shop_owner roles
  IF requested_role = 'shop_owner' THEN
    safe_role := 'shop_owner'::user_role;
    safe_app_role := 'shop_owner'::app_role;
    trial_end := now() + interval '15 days';  -- Changed from 7 to 15 days
  ELSE
    safe_role := 'customer'::user_role;
    safe_app_role := 'customer'::app_role;
    trial_end := NULL;
  END IF;
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, role, subscription_expires_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    safe_role,
    trial_end
  );
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, safe_app_role);
  
  RETURN new;
END;
$$;