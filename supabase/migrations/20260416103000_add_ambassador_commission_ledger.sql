-- Ambassador commission ledger for subscription referrals
CREATE TABLE IF NOT EXISTS public.ambassador_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  payment_reference TEXT NOT NULL,
  amount_paid_ngn NUMERIC(12,2) NOT NULL CHECK (amount_paid_ngn >= 0),
  commission_amount_ngn NUMERIC(12,2) NOT NULL CHECK (commission_amount_ngn >= 0),
  status TEXT NOT NULL DEFAULT 'awarded' CHECK (status IN ('awarded', 'reversed')),
  reversal_reason TEXT,
  reversed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ambassador_commission_payment_ref_referred_unique
  ON public.ambassador_commissions (payment_reference, referred_user_id);

CREATE INDEX IF NOT EXISTS idx_ambassador_commissions_referrer
  ON public.ambassador_commissions (referrer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ambassador_commissions_referred
  ON public.ambassador_commissions (referred_user_id, created_at DESC);

ALTER TABLE public.ambassador_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ambassador commissions"
  ON public.ambassador_commissions
  FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can view all ambassador commissions"
  ON public.ambassador_commissions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert ambassador commissions"
  ON public.ambassador_commissions
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Service role can update ambassador commissions"
  ON public.ambassador_commissions
  FOR UPDATE
  USING ((auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

DROP TRIGGER IF EXISTS trigger_ambassador_commissions_updated_at ON public.ambassador_commissions;
CREATE TRIGGER trigger_ambassador_commissions_updated_at
  BEFORE UPDATE ON public.ambassador_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
