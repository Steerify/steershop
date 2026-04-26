-- ================================================================
-- COMPLETE ADMIN FIX — Run this in Supabase SQL Editor
-- Self-contained: creates any missing tables before touching them
-- ================================================================

-- 1. Ensure admin role for steerifygroup@gmail.com
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'steerifygroup@gmail.com' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin');
    UPDATE public.profiles SET role = 'admin', needs_role_selection = false WHERE id = v_user_id;
    RAISE NOTICE 'Admin role set for steerifygroup@gmail.com (uid: %)', v_user_id;
  ELSE
    RAISE NOTICE 'User steerifygroup@gmail.com not found — log in once first, then re-run';
  END IF;
END;
$$;

-- 2. Activate ALL shops (approve any pending shops)
UPDATE public.shops SET is_active = true WHERE is_active = false OR is_active IS NULL;

-- 3. Create missing support tables (safe — uses IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.admin_mutation_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_mutation_rate_limits_lookup
  ON public.admin_mutation_rate_limits(admin_id, action, created_at DESC);

ALTER TABLE public.admin_mutation_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.admin_security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_admin_security_alerts_created_at
  ON public.admin_security_alerts(created_at DESC);

ALTER TABLE public.admin_security_alerts ENABLE ROW LEVEL SECURITY;

-- 4. Apply all admin RLS policies (drop first to avoid conflicts)

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- shops
DROP POLICY IF EXISTS "Admins can view all shops" ON public.shops;
CREATE POLICY "Admins can view all shops" ON public.shops
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- products
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- order_items
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- activity_logs
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- admin_mutation_rate_limits (now guaranteed to exist)
DROP POLICY IF EXISTS "Service role manages admin mutation rate limits" ON public.admin_mutation_rate_limits;
CREATE POLICY "Service role manages admin mutation rate limits"
  ON public.admin_mutation_rate_limits FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- admin_security_alerts
DROP POLICY IF EXISTS "Admins can view security alerts" ON public.admin_security_alerts;
CREATE POLICY "Admins can view security alerts" ON public.admin_security_alerts
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Service role inserts security alerts" ON public.admin_security_alerts;
CREATE POLICY "Service role inserts security alerts" ON public.admin_security_alerts
  FOR INSERT WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- user_roles — admins can see all rows
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 5. Create secure get_admin_stats() RPC — bypasses RLS entirely (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF NOT public.has_role(v_uid, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT jsonb_build_object(
    'total_users',    (SELECT count(*) FROM public.profiles),
    'total_shops',    (SELECT count(*) FROM public.shops),
    'active_shops',   (SELECT count(*) FROM public.shops WHERE is_active = true),
    'total_products', (SELECT count(*) FROM public.products),
    'total_orders',   (SELECT count(*) FROM public.orders),
    'pending_orders', (SELECT count(*) FROM public.orders WHERE status = 'pending'),
    'total_revenue',  (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE payment_status = 'paid')
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;

-- 6. Fix handle_new_user — hardcodes admin role for steerifygroup@gmail.com on every login
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

  user_full_name := TRIM(new.raw_user_meta_data->>'full_name');
  IF user_full_name IS NULL OR user_full_name = '' THEN
    user_full_name := split_part(new.email, '@', 1);
  END IF;

  IF new.email = 'steerifygroup@gmail.com' THEN
    safe_role := 'admin'::user_role;
    safe_app_role := 'admin'::app_role;
    trial_end := NULL;
    is_google_signup := false;
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
  VALUES (new.id, new.email, user_full_name, safe_role, trial_end, is_google_signup)
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    needs_role_selection = EXCLUDED.needs_role_selection;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, safe_app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$function$;
