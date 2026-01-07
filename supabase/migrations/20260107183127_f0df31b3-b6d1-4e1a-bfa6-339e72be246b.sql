-- Create featured_shops table for promotional banner
CREATE TABLE public.featured_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  label TEXT DEFAULT 'Featured',
  tagline TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(shop_id)
);

-- Enable RLS
ALTER TABLE public.featured_shops ENABLE ROW LEVEL SECURITY;

-- Anyone can view active featured shops (for public banner display)
CREATE POLICY "Anyone can view active featured shops"
ON public.featured_shops FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Admins can manage all featured shops
CREATE POLICY "Admins can manage featured shops"
ON public.featured_shops FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient ordering
CREATE INDEX idx_featured_shops_order ON public.featured_shops(display_order) WHERE is_active = true;