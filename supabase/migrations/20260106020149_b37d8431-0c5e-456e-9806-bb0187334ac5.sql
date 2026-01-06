-- Create onboarding responses table
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_type text,
  customer_source text,
  biggest_struggle text,
  payment_method text,
  perfect_feature text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for onboarding_responses
CREATE POLICY "Users can insert their own onboarding responses"
ON public.onboarding_responses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own onboarding responses"
ON public.onboarding_responses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add Paystack subaccount columns to shops
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS paystack_subaccount_code text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS settlement_bank_code text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS settlement_account_number text;