
-- 1. Free setup eligibility
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS free_setup_eligible boolean NOT NULL DEFAULT false;

-- 2. Referral commission columns
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS commission_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS commission_amount numeric NOT NULL DEFAULT 0;

-- 3. Paystack webhook idempotency
CREATE TABLE IF NOT EXISTS public.paystack_webhook_events (
  reference text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.paystack_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies = service role only; anon/authenticated cannot read or write.

-- 4. Ambassador profiles
CREATE TABLE IF NOT EXISTS public.ambassador_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  legal_name text NOT NULL,
  phone text NOT NULL,
  payout_bank_name text,
  payout_bank_code text,
  payout_account_number text,
  payout_account_name text,
  tier text NOT NULL DEFAULT 'starter',
  total_referrals integer NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ambassador_own_select" ON public.ambassador_profiles;
CREATE POLICY "ambassador_own_select" ON public.ambassador_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ambassador_own_insert" ON public.ambassador_profiles;
CREATE POLICY "ambassador_own_insert" ON public.ambassador_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ambassador_own_update" ON public.ambassador_profiles;
CREATE POLICY "ambassador_own_update" ON public.ambassador_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ambassador_admin_all" ON public.ambassador_profiles;
CREATE POLICY "ambassador_admin_all" ON public.ambassador_profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER ambassador_profiles_set_updated_at
  BEFORE UPDATE ON public.ambassador_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. Referral code validation - safe public function (no user_id leak)
CREATE OR REPLACE FUNCTION public.validate_referral_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
BEGIN
  SELECT user_id INTO v_referrer_id
  FROM public.referral_codes
  WHERE code = _code AND is_active = true
  LIMIT 1;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  -- Returns referrer_id only so signup flow can attribute the referral.
  -- Does NOT expose listing of all codes/users.
  RETURN jsonb_build_object('valid', true, 'referrer_id', v_referrer_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_referral_code(text) TO anon, authenticated;

-- Remove broad anon SELECT on referral_codes (keep authenticated owner reads if any).
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'public.referral_codes'::regclass
      AND polname ILIKE '%anyone%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.referral_codes', pol.polname);
  END LOOP;
END $$;
