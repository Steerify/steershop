-- Add column to track if user needs to select role
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS needs_role_selection boolean DEFAULT false;

-- Update the handle_new_user trigger to detect Google OAuth signups
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
BEGIN
  -- Get the requested role from metadata
  requested_role := new.raw_user_meta_data->>'role';
  
  -- Check if this is a Google OAuth signup (no role in metadata)
  is_google_signup := (requested_role IS NULL OR requested_role = '');
  
  -- Determine role and trial period
  IF requested_role = 'shop_owner' THEN
    safe_role := 'shop_owner'::user_role;
    safe_app_role := 'shop_owner'::app_role;
    trial_end := now() + interval '15 days';
  ELSE
    -- Default to customer for both Google signups and explicit customer signups
    safe_role := 'customer'::user_role;
    safe_app_role := 'customer'::app_role;
    trial_end := NULL;
  END IF;
  
  -- Insert profile with flag indicating if role selection is needed (for Google OAuth)
  INSERT INTO public.profiles (id, email, full_name, role, subscription_expires_at, needs_role_selection)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    safe_role,
    trial_end,
    is_google_signup  -- true for Google OAuth, false for email/password signup
  );
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, safe_app_role);
  
  RETURN new;
END;
$function$;