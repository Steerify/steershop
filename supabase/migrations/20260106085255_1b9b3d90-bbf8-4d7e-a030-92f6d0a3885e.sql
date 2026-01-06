-- 1. Subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price_monthly integer NOT NULL,
  price_yearly integer,
  features jsonb DEFAULT '[]',
  max_products integer,
  ai_features_enabled boolean DEFAULT false,
  priority_support boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. Add plan tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan_id uuid REFERENCES public.subscription_plans(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_type text DEFAULT 'monthly';

-- 3. Setup requests table for done-for-you service
CREATE TABLE IF NOT EXISTS public.setup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  payment_reference text,
  business_name text NOT NULL,
  business_description text,
  instagram_handle text,
  products_info text,
  contact_phone text,
  package_type text DEFAULT 'standard',
  amount_paid integer,
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  admin_notes text
);

-- 4. Badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon_name text NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  color text DEFAULT 'gold',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 5. User badges junction table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- 6. RLS Policies for subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription plans" 
ON public.subscription_plans FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" 
ON public.subscription_plans FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 7. RLS Policies for badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active badges" 
ON public.badges FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage badges" 
ON public.badges FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 8. RLS Policies for user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges" 
ON public.user_badges FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges" 
ON public.user_badges FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 9. RLS Policies for setup_requests
ALTER TABLE public.setup_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own setup requests" 
ON public.setup_requests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create setup requests" 
ON public.setup_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all setup requests" 
ON public.setup_requests FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 10. Seed subscription plans
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, features, max_products, ai_features_enabled, priority_support, display_order) VALUES
('Basic', 'basic', 'Perfect for getting started', 100000, 1000000, '["Up to 20 products", "Basic analytics", "WhatsApp support", "Bank transfer payments"]', 20, false, false, 1),
('Pro', 'pro', 'For growing businesses', 300000, 3000000, '["Up to 100 products", "Advanced analytics", "AI Shop Assistant", "Paystack direct payments", "Priority support"]', 100, true, true, 2),
('Business', 'business', 'For established businesses', 500000, 5000000, '["Unlimited products", "Full analytics suite", "All AI features", "Priority support", "Custom domain (coming soon)"]', null, true, true, 3)
ON CONFLICT (slug) DO NOTHING;

-- 11. Seed badges
INSERT INTO public.badges (name, slug, description, icon_name, requirement_type, requirement_value, color) VALUES
('First Sale', 'first-sale', 'Congratulations on your first sale!', 'Trophy', 'sales', 1, 'amber'),
('Product Pro', 'product-pro', '10 products listed in your shop', 'Package', 'products', 10, 'blue'),
('Hustler', 'hustler', '50 orders completed', 'Zap', 'orders', 50, 'purple'),
('Century Club', 'century-club', '100 sales milestone achieved', 'Award', 'sales', 100, 'green'),
('Market Leader', 'market-leader', '500 sales - You are a market leader!', 'Crown', 'sales', 500, 'orange'),
('Legend Status', 'legend', '1000+ sales - Legendary entrepreneur!', 'Flame', 'sales', 1000, 'red')
ON CONFLICT (slug) DO NOTHING;

-- 12. Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  shop_owner_id uuid;
  badge_record record;
  current_count integer;
BEGIN
  -- Get the shop owner
  SELECT owner_id INTO shop_owner_id FROM shops WHERE id = NEW.shop_id;
  
  IF shop_owner_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check each badge
  FOR badge_record IN SELECT * FROM badges WHERE is_active = true LOOP
    -- Calculate current count based on requirement type
    IF badge_record.requirement_type = 'orders' THEN
      SELECT COUNT(*) INTO current_count 
      FROM orders o 
      JOIN shops s ON o.shop_id = s.id 
      WHERE s.owner_id = shop_owner_id AND o.status = 'completed';
    ELSIF badge_record.requirement_type = 'sales' THEN
      SELECT COUNT(*) INTO current_count 
      FROM orders o 
      JOIN shops s ON o.shop_id = s.id 
      WHERE s.owner_id = shop_owner_id AND o.payment_status = 'paid';
    END IF;

    -- Award badge if threshold met and not already earned
    IF current_count >= badge_record.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (shop_owner_id, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- 13. Function to check product badges
CREATE OR REPLACE FUNCTION public.check_product_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  shop_owner_id uuid;
  badge_record record;
  product_count integer;
BEGIN
  -- Get the shop owner
  SELECT owner_id INTO shop_owner_id FROM shops WHERE id = NEW.shop_id;
  
  IF shop_owner_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count products for this shop owner
  SELECT COUNT(*) INTO product_count 
  FROM products p 
  JOIN shops s ON p.shop_id = s.id 
  WHERE s.owner_id = shop_owner_id;

  -- Check product badges
  FOR badge_record IN SELECT * FROM badges WHERE requirement_type = 'products' AND is_active = true LOOP
    IF product_count >= badge_record.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (shop_owner_id, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- 14. Create triggers for badge awarding
DROP TRIGGER IF EXISTS check_order_badges ON orders;
CREATE TRIGGER check_order_badges
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (NEW.status = 'completed' OR NEW.payment_status = 'paid')
EXECUTE FUNCTION check_and_award_badges();

DROP TRIGGER IF EXISTS check_product_badges_trigger ON products;
CREATE TRIGGER check_product_badges_trigger
AFTER INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION check_product_badges();