-- Feature usage tracking table (for monthly limits)
CREATE TABLE public.feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  month_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_name, month_year)
);

-- Shop reactions table (customers react to shops)
CREATE TABLE public.shop_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'love', 'wow', 'cool', 'star')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id, customer_id)
);

-- Top seller banners table
CREATE TABLE public.top_seller_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  month_year TEXT NOT NULL,
  total_sales INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month_year)
);

-- Enable RLS on all tables
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_seller_banners ENABLE ROW LEVEL SECURITY;

-- Feature usage policies
CREATE POLICY "Users can view their own usage"
ON public.feature_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
ON public.feature_usage FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
ON public.feature_usage FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Shop reactions policies
CREATE POLICY "Anyone can view reactions"
ON public.shop_reactions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add reactions"
ON public.shop_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own reactions"
ON public.shop_reactions FOR UPDATE
TO authenticated
USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own reactions"
ON public.shop_reactions FOR DELETE
TO authenticated
USING (auth.uid() = customer_id);

-- Top seller banners policies (public read)
CREATE POLICY "Anyone can view top seller banners"
ON public.top_seller_banners FOR SELECT
USING (true);

-- Security definer function to check feature usage (server-side verification)
CREATE OR REPLACE FUNCTION public.check_feature_usage(
  _user_id UUID,
  _feature_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_usage INTEGER;
  max_usage INTEGER;
  current_month TEXT;
  user_plan_slug TEXT;
  is_business BOOLEAN;
BEGIN
  current_month := to_char(NOW(), 'YYYY-MM');
  
  -- Get user's subscription plan
  SELECT sp.slug INTO user_plan_slug
  FROM profiles p
  LEFT JOIN subscription_plans sp ON p.subscription_plan_id = sp.id
  WHERE p.id = _user_id;
  
  is_business := COALESCE(user_plan_slug, '') = 'business';
  
  -- Get current usage
  SELECT COALESCE(usage_count, 0) INTO current_usage
  FROM feature_usage
  WHERE user_id = _user_id 
    AND feature_name = _feature_name 
    AND month_year = current_month;
  
  -- Default to 0 if no record
  current_usage := COALESCE(current_usage, 0);
  
  -- Determine max usage based on feature and plan
  IF _feature_name = 'stroke_my_shop' THEN
    IF is_business THEN
      max_usage := -1; -- Unlimited
    ELSE
      max_usage := 5;
    END IF;
  ELSE
    max_usage := 10; -- Default for other features
  END IF;
  
  RETURN json_build_object(
    'can_use', CASE WHEN max_usage = -1 THEN true ELSE current_usage < max_usage END,
    'current_usage', current_usage,
    'max_usage', max_usage,
    'is_business', is_business,
    'plan_slug', COALESCE(user_plan_slug, 'free')
  );
END;
$$;

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION public.increment_feature_usage(
  _user_id UUID,
  _feature_name TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month TEXT;
  new_count INTEGER;
BEGIN
  current_month := to_char(NOW(), 'YYYY-MM');
  
  INSERT INTO feature_usage (user_id, feature_name, month_year, usage_count)
  VALUES (_user_id, _feature_name, current_month, 1)
  ON CONFLICT (user_id, feature_name, month_year) 
  DO UPDATE SET 
    usage_count = feature_usage.usage_count + 1,
    updated_at = NOW()
  RETURNING usage_count INTO new_count;
  
  RETURN new_count;
END;
$$;