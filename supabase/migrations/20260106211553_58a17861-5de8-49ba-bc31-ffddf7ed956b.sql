-- Fix: Add 'both' to payment_method constraint
ALTER TABLE public.shops DROP CONSTRAINT IF EXISTS shops_payment_method_check;
ALTER TABLE public.shops ADD CONSTRAINT shops_payment_method_check 
CHECK (payment_method = ANY (ARRAY['bank_transfer', 'paystack', 'both']));

-- Create subscription_history table
CREATE TABLE public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  plan_name TEXT,
  amount INTEGER,
  payment_reference TEXT,
  previous_expiry_at TIMESTAMPTZ,
  new_expiry_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
CREATE POLICY "Users can view own history"
ON public.subscription_history FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all and insert
CREATE POLICY "Admins can manage history"
ON public.subscription_history FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to insert their own history (for payment verification)
CREATE POLICY "Users can insert own history"
ON public.subscription_history FOR INSERT
WITH CHECK (auth.uid() = user_id);