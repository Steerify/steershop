-- Create a table to track deleted accounts and prevent re-registration
CREATE TABLE IF NOT EXISTS public.deleted_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  google_id text,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  reason text,
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;

-- Only admins can view deleted accounts
CREATE POLICY "Only admins can view deleted accounts"
  ON public.deleted_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_deleted_accounts_email ON public.deleted_accounts(email);
CREATE INDEX idx_deleted_accounts_google_id ON public.deleted_accounts(google_id) WHERE google_id IS NOT NULL;

-- Update handle_new_user to check for deleted accounts
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
  user_google_id text;
BEGIN
  -- Get the requested role from metadata
  requested_role := new.raw_user_meta_data->>'role';
  
  -- Check if this is a Google OAuth signup (no role in metadata)
  is_google_signup := (requested_role IS NULL OR requested_role = '');
  
  -- Extract Google ID if available
  user_google_id := new.raw_user_meta_data->>'provider_id';
  
  -- Check if this account was previously deleted
  IF EXISTS (
    SELECT 1 FROM public.deleted_accounts
    WHERE email = new.email
    OR (google_id IS NOT NULL AND google_id = user_google_id)
  ) THEN
    RAISE EXCEPTION 'This account was previously deleted and cannot be re-registered. Please contact support if you believe this is an error.';
  END IF;
  
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
