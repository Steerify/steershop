-- Ambassador commission redesign
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.10,
  ADD COLUMN IF NOT EXISTS source_payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS source_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS commission_currency TEXT,
  ADD COLUMN IF NOT EXISTS commission_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS commission_created_at TIMESTAMPTZ;

ALTER TABLE public.referrals
  DROP CONSTRAINT IF EXISTS referrals_commission_status_check;

ALTER TABLE public.referrals
  ADD CONSTRAINT referrals_commission_status_check
  CHECK (commission_status IN ('pending', 'approved', 'paid', 'reversed'));

CREATE TABLE IF NOT EXISTS public.ambassador_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  legal_name TEXT NOT NULL,
  phone TEXT,
  payout_bank_name TEXT,
  payout_bank_code TEXT,
  payout_account_number TEXT,
  payout_account_name TEXT,
  tax_id TEXT,
  compliance_notes TEXT,
  enrollment_status TEXT NOT NULL DEFAULT 'active' CHECK (enrollment_status IN ('active', 'suspended')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ambassador profile" ON public.ambassador_profiles;
CREATE POLICY "Users can view own ambassador profile"
ON public.ambassador_profiles
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own ambassador profile" ON public.ambassador_profiles;
CREATE POLICY "Users can upsert own ambassador profile"
ON public.ambassador_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ambassador profile" ON public.ambassador_profiles;
CREATE POLICY "Users can update own ambassador profile"
ON public.ambassador_profiles
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all ambassador profiles" ON public.ambassador_profiles;
CREATE POLICY "Admins can view all ambassador profiles"
ON public.ambassador_profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.set_ambassador_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ambassador_profiles_set_updated_at ON public.ambassador_profiles;
CREATE TRIGGER ambassador_profiles_set_updated_at
BEFORE UPDATE ON public.ambassador_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_ambassador_profiles_updated_at();

CREATE OR REPLACE FUNCTION public.process_referral_commission_from_subscription()
RETURNS TRIGGER AS $$
DECLARE
  referral_record public.referrals%ROWTYPE;
  plan_price NUMERIC(12,2);
  effective_price NUMERIC(12,2);
  calculated_commission NUMERIC(12,2);
BEGIN
  IF NEW.is_subscribed IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;

  IF NEW.payment_reference IS NULL OR NEW.payment_reference = '' OR NEW.payment_reference = COALESCE(OLD.payment_reference, '') THEN
    RETURN NEW;
  END IF;

  SELECT * INTO referral_record
  FROM public.referrals
  WHERE referred_id = NEW.id
    AND source_payment_reference IS NULL
  ORDER BY created_at ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  IF NEW.subscription_plan_id IS NOT NULL THEN
    SELECT
      CASE
        WHEN COALESCE(NEW.subscription_type, 'monthly') = 'yearly' THEN COALESCE(price_yearly, price_monthly)
        ELSE price_monthly
      END
    INTO plan_price
    FROM public.subscription_plans
    WHERE id = NEW.subscription_plan_id;
  END IF;

  effective_price := COALESCE(plan_price, 0);
  calculated_commission := ROUND(effective_price * COALESCE(referral_record.commission_rate, 0.10), 2);

  UPDATE public.referrals
  SET status = 'rewarded',
      qualified_at = now(),
      rewarded_at = now(),
      source_payment_reference = NEW.payment_reference,
      source_subscription_id = COALESCE(NEW.subscription_plan_id::text, referral_record.source_subscription_id),
      commission_amount = calculated_commission,
      commission_currency = 'NGN',
      commission_status = CASE WHEN calculated_commission > 0 THEN 'pending' ELSE 'approved' END,
      commission_created_at = now()
  WHERE id = referral_record.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_referral_commission_from_subscription ON public.profiles;
CREATE TRIGGER trigger_referral_commission_from_subscription
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.process_referral_commission_from_subscription();
