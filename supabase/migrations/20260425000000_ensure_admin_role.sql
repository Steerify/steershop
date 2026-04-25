-- Migration: Ensure steerifygroup@gmail.com has admin role in both profiles and user_roles tables
-- This is idempotent — safe to run multiple times

-- Step 1: Update profiles table role to 'admin' for the admin email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'steerifygroup@gmail.com';

-- Step 2: Ensure the user_roles table also has the admin row
-- First find the user id from auth.users (the source of truth for auth)
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'steerifygroup@gmail.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Upsert the admin role row (won't duplicate if already exists)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Also ensure the profiles row has the correct role and email
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = v_user_id;

    RAISE NOTICE 'Admin role ensured for user: %', v_user_id;
  ELSE
    RAISE NOTICE 'Admin user steerifygroup@gmail.com not found in auth.users — they may not have signed up yet';
  END IF;
END;
$$;
