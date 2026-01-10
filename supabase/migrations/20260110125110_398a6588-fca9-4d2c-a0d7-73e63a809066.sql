-- Fix 3 permissive RLS policies that use WITH CHECK (true)

-- 1. Fix featured_shop_analytics INSERT policy
DROP POLICY IF EXISTS "Anyone can log clicks" ON public.featured_shop_analytics;
CREATE POLICY "Anyone can log clicks with valid data" ON public.featured_shop_analytics
  FOR INSERT WITH CHECK (
    -- Must reference valid featured shop
    EXISTS (
      SELECT 1 FROM public.featured_shops 
      WHERE featured_shops.id = featured_shop_id 
      AND featured_shops.is_active = true
    )
    -- User_id must be null or match authenticated user
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- 2. Fix platform_feedback INSERT policy
DROP POLICY IF EXISTS "Anyone can create feedback" ON public.platform_feedback;
CREATE POLICY "Authenticated users can create feedback" ON public.platform_feedback
  FOR INSERT TO authenticated WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- 3. Fix referrals INSERT policy
DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;
CREATE POLICY "Valid referral insertions only" ON public.referrals
  FOR INSERT TO authenticated WITH CHECK (
    -- Referred user must be the authenticated user (user being referred signs up)
    referred_id = auth.uid()
  );

-- 4. Fix shops_public view security (recreate with security_invoker)
DROP VIEW IF EXISTS public.shops_public;
CREATE VIEW public.shops_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  owner_id,
  shop_name,
  shop_slug,
  description,
  logo_url,
  banner_url,
  average_rating,
  total_reviews,
  is_active,
  whatsapp_number,
  payment_method,
  paystack_public_key,
  created_at,
  updated_at
FROM public.shops
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.shops_public TO anon, authenticated;

-- 5. Fix function search paths for security
ALTER FUNCTION public.cleanup_expired_featured_shops() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_rate_limits() SET search_path = public;