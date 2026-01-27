-- 1. Platform feedback rating columns
ALTER TABLE platform_feedback ADD COLUMN IF NOT EXISTS 
  rating INTEGER;
ALTER TABLE platform_feedback ADD COLUMN IF NOT EXISTS 
  show_on_homepage BOOLEAN DEFAULT false;

-- Add check constraint separately to avoid issues
ALTER TABLE platform_feedback DROP CONSTRAINT IF EXISTS platform_feedback_rating_check;
ALTER TABLE platform_feedback ADD CONSTRAINT platform_feedback_rating_check CHECK (rating >= 1 AND rating <= 5);

-- 2. Subscription plan marketing features
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS 
  includes_business_profile BOOLEAN DEFAULT false;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS 
  includes_google_setup BOOLEAN DEFAULT false;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS 
  includes_seo BOOLEAN DEFAULT false;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS 
  includes_organic_marketing BOOLEAN DEFAULT false;

-- 3. Marketing services tracking table
CREATE TABLE IF NOT EXISTS marketing_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  consultation_date TIMESTAMPTZ,
  consultation_notes TEXT,
  amount INTEGER,
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending',
  google_profile_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for marketing_services
ALTER TABLE marketing_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can view their marketing services"
  ON marketing_services FOR SELECT
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.id = marketing_services.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Shop owners can insert their marketing services"
  ON marketing_services FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.id = marketing_services.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Shop owners can update their marketing services"
  ON marketing_services FOR UPDATE
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.id = marketing_services.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Admins can manage all marketing services"
  ON marketing_services FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_marketing_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_marketing_services_timestamp ON marketing_services;
CREATE TRIGGER update_marketing_services_timestamp
  BEFORE UPDATE ON marketing_services
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_services_updated_at();