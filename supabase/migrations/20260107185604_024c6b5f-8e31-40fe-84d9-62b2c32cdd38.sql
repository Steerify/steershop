-- Create featured shop analytics table for click tracking
CREATE TABLE public.featured_shop_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  featured_shop_id UUID NOT NULL REFERENCES featured_shops(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'homepage',
  device_type TEXT
);

-- Indexes for efficient aggregation queries
CREATE INDEX idx_featured_analytics_shop ON featured_shop_analytics(shop_id);
CREATE INDEX idx_featured_analytics_date ON featured_shop_analytics(clicked_at);
CREATE INDEX idx_featured_analytics_featured ON featured_shop_analytics(featured_shop_id);

-- RLS: Anyone can insert (for tracking), only admins can read
ALTER TABLE featured_shop_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log clicks" ON featured_shop_analytics 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics" ON featured_shop_analytics 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create function to cleanup expired featured shops
CREATE OR REPLACE FUNCTION public.cleanup_expired_featured_shops()
RETURNS void AS $$
BEGIN
  UPDATE featured_shops 
  SET is_active = false 
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create poster templates table
CREATE TABLE public.poster_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'promotional',
  is_public BOOLEAN DEFAULT false,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_platform BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_poster_templates_category ON poster_templates(category);
CREATE INDEX idx_poster_templates_public ON poster_templates(is_public) WHERE is_public = true;

ALTER TABLE poster_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public templates" ON poster_templates
FOR SELECT USING (is_public = true OR is_platform = true OR creator_id = auth.uid());

CREATE POLICY "Users can create templates" ON poster_templates
FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own templates" ON poster_templates
FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own templates" ON poster_templates
FOR DELETE USING (auth.uid() = creator_id);

-- Create user posters table
CREATE TABLE public.user_posters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  template_id UUID REFERENCES poster_templates(id) ON DELETE SET NULL,
  canvas_data JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_posters_user ON user_posters(user_id);
CREATE INDEX idx_user_posters_shop ON user_posters(shop_id);

ALTER TABLE user_posters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own posters" ON user_posters
FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create posters" ON user_posters
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posters" ON user_posters
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posters" ON user_posters
FOR DELETE USING (auth.uid() = user_id);

-- Create marketing AI usage table
CREATE TABLE public.marketing_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  prompt TEXT,
  result TEXT,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_ai_user ON marketing_ai_usage(user_id);
CREATE INDEX idx_marketing_ai_date ON marketing_ai_usage(created_at);

ALTER TABLE marketing_ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON marketing_ai_usage
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert usage" ON marketing_ai_usage
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at on new tables
CREATE TRIGGER update_poster_templates_updated_at
  BEFORE UPDATE ON poster_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_posters_updated_at
  BEFORE UPDATE ON user_posters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();