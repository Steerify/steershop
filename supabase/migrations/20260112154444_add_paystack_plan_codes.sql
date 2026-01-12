-- Add Paystack plan code columns to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS paystack_plan_monthly TEXT,
ADD COLUMN IF NOT EXISTS paystack_plan_yearly TEXT;

-- Comment on columns
COMMENT ON COLUMN public.subscription_plans.paystack_plan_monthly IS 'Paystack Plan Code for monthly billing cycle';
COMMENT ON COLUMN public.subscription_plans.paystack_plan_yearly IS 'Paystack Plan Code for yearly billing cycle';
