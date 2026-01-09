-- =============================================
-- SECURITY FIXES: RLS Policies and Data Protection (v3)
-- =============================================

-- 1. Fix profiles table - remove overly permissive policy
DROP POLICY IF EXISTS "Anyone can view subscription status" ON public.profiles;

-- 2. Drop and recreate profile policies to ensure proper setup
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view limited profile data for shop owners" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Public can view limited profile data for shop owners" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.owner_id = profiles.id 
    AND shops.is_active = true
  )
);

-- 3. Add phone verification columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verification_code TEXT,
ADD COLUMN IF NOT EXISTS phone_verification_expires TIMESTAMPTZ;

-- 4. Create index for phone verification lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verification 
ON public.profiles(phone_verification_code) 
WHERE phone_verification_code IS NOT NULL;

-- 5. Create rate limiting table for auth attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  attempt_type TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  last_attempt TIMESTAMPTZ DEFAULT now(),
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on rate limits
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if any
DROP POLICY IF EXISTS "Service role manages rate limits" ON public.auth_rate_limits;

-- Only allow service role to manage rate limits
CREATE POLICY "Service role manages rate limits" 
ON public.auth_rate_limits 
FOR ALL 
USING (false);

-- Create index for rate limit lookups
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_identifier 
ON public.auth_rate_limits(identifier, attempt_type);

-- Create cleanup function for expired rate limits
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.auth_rate_limits 
  WHERE last_attempt < now() - interval '1 hour';
END;
$$;