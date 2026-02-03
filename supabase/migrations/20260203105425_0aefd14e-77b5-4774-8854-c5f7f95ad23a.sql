-- Add platform fee columns to revenue_transactions
ALTER TABLE public.revenue_transactions
ADD COLUMN IF NOT EXISTS gross_amount numeric,
ADD COLUMN IF NOT EXISTS platform_fee_percentage numeric DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0;

-- Create platform_earnings table for admin reporting
CREATE TABLE IF NOT EXISTS public.platform_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public.revenue_transactions(id) ON DELETE SET NULL,
  shop_id uuid NOT NULL,
  order_id uuid,
  gross_amount numeric NOT NULL,
  fee_percentage numeric NOT NULL DEFAULT 2.5,
  fee_amount numeric NOT NULL,
  net_to_shop numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on platform_earnings
ALTER TABLE public.platform_earnings ENABLE ROW LEVEL SECURITY;

-- Only admins can view platform earnings
CREATE POLICY "Admins can view platform earnings"
  ON public.platform_earnings FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- System/edge functions can insert earnings (via service role)
CREATE POLICY "System can insert earnings"
  ON public.platform_earnings FOR INSERT
  WITH CHECK (true);

-- Create platform_settings table for configurable settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

-- Enable RLS on platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage platform settings
CREATE POLICY "Admins can manage platform settings"
  ON public.platform_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default transaction fee percentage
INSERT INTO public.platform_settings (key, value)
VALUES ('transaction_fee_percentage', '{"value": 2.5}'::jsonb)
ON CONFLICT (key) DO NOTHING;