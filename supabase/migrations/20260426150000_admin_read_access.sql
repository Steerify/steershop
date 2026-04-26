-- Migration: Grant admins SELECT access to core tables for dashboard analytics and management
-- Description: Ensures the admin dashboard can read counts and details from all primary tables.
-- Date: 2026-04-26

DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
  CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Shops
  DROP POLICY IF EXISTS "Admins can view all shops" ON public.shops;
  CREATE POLICY "Admins can view all shops" ON public.shops
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Products
  DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
  CREATE POLICY "Admins can view all products" ON public.products
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Orders
  DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
  CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Order Items
  DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
  CREATE POLICY "Admins can view all order items" ON public.order_items
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Reviews
  DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
  CREATE POLICY "Admins can manage all reviews" ON public.reviews
    FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Subscription Notifications
  DROP POLICY IF EXISTS "Admins can view all notifications" ON public.subscription_notifications;
  CREATE POLICY "Admins can view all notifications" ON public.subscription_notifications
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Platform Earnings
  DROP POLICY IF EXISTS "Admins can view platform earnings" ON public.platform_earnings;
  CREATE POLICY "Admins can view platform earnings" ON public.platform_earnings
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Revenue Transactions
  DROP POLICY IF EXISTS "Admins can view revenue transactions" ON public.revenue_transactions;
  CREATE POLICY "Admins can view revenue transactions" ON public.revenue_transactions
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Shop Payouts
  DROP POLICY IF EXISTS "Admins can view shop payouts" ON public.shop_payouts;
  CREATE POLICY "Admins can view shop payouts" ON public.shop_payouts
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Courses
  DROP POLICY IF EXISTS "Admins can view all courses" ON public.courses;
  CREATE POLICY "Admins can view all courses" ON public.courses
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Rewards Points
  DROP POLICY IF EXISTS "Admins can view all reward points" ON public.rewards_points;
  CREATE POLICY "Admins can view all reward points" ON public.rewards_points
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Rewards Prizes
  DROP POLICY IF EXISTS "Admins can view all reward prizes" ON public.rewards_prizes;
  CREATE POLICY "Admins can view all reward prizes" ON public.rewards_prizes
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Referrals
  DROP POLICY IF EXISTS "Admins can view all referrals" ON public.referrals;
  CREATE POLICY "Admins can view all referrals" ON public.referrals
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Referral Codes
  DROP POLICY IF EXISTS "Admins can view all referral codes" ON public.referral_codes;
  CREATE POLICY "Admins can view all referral codes" ON public.referral_codes
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Feedback
  DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
  CREATE POLICY "Admins can view all feedback" ON public.feedback
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

  -- Platform Updates
  DROP POLICY IF EXISTS "Admins can view all platform updates" ON public.platform_updates;
  CREATE POLICY "Admins can view all platform updates" ON public.platform_updates
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

END
$$;
