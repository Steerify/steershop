-- ============================================================
-- STEERSHOP: REVERT TO ORIGINAL AUTH & TRIGGER STATE
-- Run this script in your Supabase SQL Editor to undo manual changes.
-- ============================================================

-- 1. Remove the manual sync triggers and functions
DROP TRIGGER IF EXISTS ensure_user_role_sync ON public.profiles;
DROP TRIGGER IF EXISTS trg_sync_user_role ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_user_role_from_profile();

-- 2. Restore the original handle_new_user function (Migration 20260215085322)
-- This version uses: full_name, role, subscription_expires_at, needs_role_selection
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

  -- Original logic: shop_owner vs customer
  IF requested_role = 'shop_owner' THEN
    safe_role := 'shop_owner'::user_role;
    safe_app_role := 'shop_owner'::app_role;
    trial_end := now() + interval '15 days';
  ELSE
    safe_role := 'customer'::user_role;
    safe_app_role := 'customer'::app_role;
    trial_end := NULL;
  END IF;
  
  -- Insert into profiles using CORRECT column names
  INSERT INTO public.profiles (id, email, full_name, role, subscription_expires_at, needs_role_selection)
  VALUES (
    new.id,
    new.email,
    user_full_name,
    safe_role,
    trial_end,
    is_google_signup
  );
  
  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, safe_app_role);
  
  RETURN new;
END;
$function$;

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
