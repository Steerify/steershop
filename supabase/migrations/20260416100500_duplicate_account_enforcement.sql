-- Duplicate-account prevention and staged enforcement framework

-- 1) Phone normalization + identity signal primitives
CREATE OR REPLACE FUNCTION public.normalize_phone_e164(raw_phone text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cleaned text;
BEGIN
  IF raw_phone IS NULL OR btrim(raw_phone) = '' THEN
    RETURN NULL;
  END IF;

  cleaned := regexp_replace(raw_phone, '[^0-9+]', '', 'g');

  -- Convert local Nigerian format 0XXXXXXXXXX => +234XXXXXXXXXX
  IF cleaned ~ '^0[0-9]{10}$' THEN
    RETURN '+234' || substr(cleaned, 2);
  END IF;

  -- Convert bare Nigerian format 234XXXXXXXXXX => +234XXXXXXXXXX
  IF cleaned ~ '^234[0-9]{10}$' THEN
    RETURN '+' || cleaned;
  END IF;

  -- Generic E.164 candidate already prefixed
  IF cleaned ~ '^\+[1-9][0-9]{7,14}$' THEN
    RETURN cleaned;
  END IF;

  -- Generic 10-15 digit number without plus; normalize by adding plus
  IF cleaned ~ '^[1-9][0-9]{9,14}$' THEN
    RETURN '+' || cleaned;
  END IF;

  RETURN NULL;
END;
$$;

ALTER TABLE public.deleted_accounts
  ADD COLUMN IF NOT EXISTS reason text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS normalized_phone text,
  ADD COLUMN IF NOT EXISTS identity_signal_hash text,
  ADD COLUMN IF NOT EXISTS identity_signal_confidence numeric(4,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS account_locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS enforcement_stage text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS deletion_scheduled_for timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_confirmed_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_account_status_allowed_values'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_account_status_allowed_values
      CHECK (account_status IN ('active', 'locked', 'under_review', 'pending_deletion', 'deleted'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_enforcement_stage_allowed_values'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_enforcement_stage_allowed_values
      CHECK (enforcement_stage IN ('none', 'auto_locked', 'benefits_revoked', 'in_review', 'deletion_scheduled', 'deleted'));
  END IF;
END $$;

UPDATE public.profiles
SET normalized_phone = public.normalize_phone_e164(phone)
WHERE phone IS NOT NULL
  AND (normalized_phone IS NULL OR normalized_phone IS DISTINCT FROM public.normalize_phone_e164(phone));

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_verified_normalized_phone_unique
ON public.profiles (normalized_phone)
WHERE phone_verified = true
  AND normalized_phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_identity_signal
ON public.profiles(identity_signal_hash)
WHERE identity_signal_hash IS NOT NULL;

-- Keep normalized_phone in sync any time phone changes.
CREATE OR REPLACE FUNCTION public.sync_normalized_phone()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.normalized_phone := public.normalize_phone_e164(NEW.phone);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_normalized_phone ON public.profiles;
CREATE TRIGGER trg_sync_normalized_phone
BEFORE INSERT OR UPDATE OF phone ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_normalized_phone();

-- 2) Risk telemetry + review queue + immutable audit
CREATE TABLE IF NOT EXISTS public.fraud_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  related_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  reason text NOT NULL,
  confidence_score numeric(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  automated_action text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'confirmed_abuse', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz
);

ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can review fraud flags" ON public.fraud_flags;
CREATE POLICY "Admins can review fraud flags"
ON public.fraud_flags
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.fraud_review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fraud_flag_id uuid REFERENCES public.fraud_flags(id) ON DELETE SET NULL,
  queue_status text NOT NULL DEFAULT 'pending' CHECK (queue_status IN ('pending', 'in_review', 'resolved')),
  priority text NOT NULL DEFAULT 'high' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  assigned_admin uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz
);

ALTER TABLE public.fraud_review_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage fraud review queue" ON public.fraud_review_queue;
CREATE POLICY "Admins can manage fraud review queue"
ON public.fraud_review_queue
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.fraud_enforcement_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.fraud_enforcement_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read fraud enforcement audit" ON public.fraud_enforcement_audit;
CREATE POLICY "Admins can read fraud enforcement audit"
ON public.fraud_enforcement_audit
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.prevent_fraud_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'fraud_enforcement_audit is append-only';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_fraud_audit_update ON public.fraud_enforcement_audit;
CREATE TRIGGER trg_prevent_fraud_audit_update
BEFORE UPDATE ON public.fraud_enforcement_audit
FOR EACH ROW
EXECUTE FUNCTION public.prevent_fraud_audit_mutation();

DROP TRIGGER IF EXISTS trg_prevent_fraud_audit_delete ON public.fraud_enforcement_audit;
CREATE TRIGGER trg_prevent_fraud_audit_delete
BEFORE DELETE ON public.fraud_enforcement_audit
FOR EACH ROW
EXECUTE FUNCTION public.prevent_fraud_audit_mutation();

-- 3) Referral qualification hard blocks based on identity/payment risk
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_instrument_fingerprint text;

ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS disqualified_reason text,
  ADD COLUMN IF NOT EXISTS disqualified_at timestamptz,
  ADD COLUMN IF NOT EXISTS fraud_flag_id uuid REFERENCES public.fraud_flags(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.queue_account_for_fraud_review(
  p_user_id uuid,
  p_reason text,
  p_confidence numeric,
  p_evidence jsonb,
  p_related_user_id uuid DEFAULT NULL,
  p_referral_id uuid DEFAULT NULL,
  p_automated_action text DEFAULT 'auto_lock_and_revoke'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fraud_flag_id uuid;
  v_now timestamptz := now();
BEGIN
  INSERT INTO public.fraud_flags (
    user_id,
    related_user_id,
    referral_id,
    reason,
    confidence_score,
    evidence,
    automated_action
  ) VALUES (
    p_user_id,
    p_related_user_id,
    p_referral_id,
    p_reason,
    p_confidence,
    coalesce(p_evidence, '{}'::jsonb),
    p_automated_action
  )
  RETURNING id INTO v_fraud_flag_id;

  UPDATE public.profiles
  SET account_status = 'locked',
      account_locked_at = coalesce(account_locked_at, v_now),
      enforcement_stage = 'auto_locked',
      is_subscribed = false,
      is_reseller = false
  WHERE id = p_user_id;

  -- Revoke referral benefits/commissions and pending tier rewards
  UPDATE public.referrals
  SET status = 'blocked',
      points_earned = 0,
      disqualified_reason = coalesce(disqualified_reason, 'fraud_enforcement'),
      disqualified_at = coalesce(disqualified_at, v_now)
  WHERE referrer_id = p_user_id
     OR referred_id = p_user_id;

  UPDATE public.rewards_points
  SET total_points = 0,
      updated_at = v_now
  WHERE user_id = p_user_id;

  UPDATE public.ambassador_tiers
  SET reward_claimed = false,
      claimed_at = NULL
  WHERE user_id = p_user_id;

  UPDATE public.profiles
  SET enforcement_stage = 'benefits_revoked'
  WHERE id = p_user_id;

  INSERT INTO public.fraud_review_queue (user_id, fraud_flag_id, queue_status, priority, notes)
  VALUES (p_user_id, v_fraud_flag_id, 'pending', 'high', 'Auto-queued for manual review')
  ON CONFLICT DO NOTHING;

  UPDATE public.profiles
  SET account_status = 'under_review',
      enforcement_stage = 'in_review',
      deletion_scheduled_for = coalesce(deletion_scheduled_for, v_now + interval '14 days')
  WHERE id = p_user_id;

  INSERT INTO public.fraud_enforcement_audit(user_id, action, metadata)
  VALUES
    (p_user_id, 'auto_lock_account', jsonb_build_object('fraud_flag_id', v_fraud_flag_id, 'reason', p_reason, 'confidence', p_confidence)),
    (p_user_id, 'revoke_benefits_commissions', jsonb_build_object('fraud_flag_id', v_fraud_flag_id)),
    (p_user_id, 'queue_admin_review', jsonb_build_object('fraud_flag_id', v_fraud_flag_id)),
    (p_user_id, 'schedule_delayed_deletion_window', jsonb_build_object('fraud_flag_id', v_fraud_flag_id, 'deletion_window_days', 14));

  RETURN v_fraud_flag_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.referral_should_be_blocked(
  p_referrer_id uuid,
  p_referred_id uuid,
  p_order_id uuid
)
RETURNS TABLE(should_block boolean, reason text, confidence numeric, evidence jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer public.profiles%ROWTYPE;
  v_referred public.profiles%ROWTYPE;
  v_order_fingerprint text;
BEGIN
  SELECT * INTO v_referrer FROM public.profiles WHERE id = p_referrer_id;
  SELECT * INTO v_referred FROM public.profiles WHERE id = p_referred_id;

  IF v_referrer.normalized_phone IS NOT NULL
     AND v_referrer.normalized_phone = v_referred.normalized_phone THEN
    RETURN QUERY SELECT
      true,
      'shared_normalized_phone',
      0.99::numeric,
      jsonb_build_object(
        'referrer_phone', v_referrer.normalized_phone,
        'referred_phone', v_referred.normalized_phone
      );
    RETURN;
  END IF;

  SELECT payment_instrument_fingerprint
  INTO v_order_fingerprint
  FROM public.orders
  WHERE id = p_order_id;

  IF v_order_fingerprint IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM public.orders o
       WHERE o.customer_id = p_referrer_id
         AND o.payment_status = 'paid'
         AND o.payment_instrument_fingerprint = v_order_fingerprint
     ) THEN
    RETURN QUERY SELECT
      true,
      'shared_payment_instrument_fingerprint',
      0.97::numeric,
      jsonb_build_object('payment_instrument_fingerprint', v_order_fingerprint);
    RETURN;
  END IF;

  IF v_referrer.identity_signal_hash IS NOT NULL
     AND v_referrer.identity_signal_hash = v_referred.identity_signal_hash
     AND v_referrer.identity_signal_confidence >= 0.800
     AND v_referred.identity_signal_confidence >= 0.800 THEN
    RETURN QUERY SELECT
      true,
      'shared_high_confidence_identity_signal',
      LEAST(v_referrer.identity_signal_confidence, v_referred.identity_signal_confidence),
      jsonb_build_object(
        'identity_signal_hash', v_referrer.identity_signal_hash,
        'referrer_confidence', v_referrer.identity_signal_confidence,
        'referred_confidence', v_referred.identity_signal_confidence
      );
    RETURN;
  END IF;

  RETURN QUERY SELECT false, NULL::text, 0::numeric, '{}'::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_referral_reward()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_record public.referrals%ROWTYPE;
  referrer_bonus integer := 50;
  referred_bonus integer := 25;
  risk_record record;
  v_fraud_flag_id uuid;
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    SELECT * INTO referral_record
    FROM public.referrals
    WHERE referred_id = NEW.customer_id
      AND status = 'pending'
    LIMIT 1;

    IF FOUND THEN
      SELECT *
      INTO risk_record
      FROM public.referral_should_be_blocked(referral_record.referrer_id, referral_record.referred_id, NEW.id)
      LIMIT 1;

      IF coalesce(risk_record.should_block, false) THEN
        v_fraud_flag_id := public.queue_account_for_fraud_review(
          p_user_id => referral_record.referred_id,
          p_reason => risk_record.reason,
          p_confidence => risk_record.confidence,
          p_evidence => risk_record.evidence,
          p_related_user_id => referral_record.referrer_id,
          p_referral_id => referral_record.id,
          p_automated_action => 'block_referral_qualification'
        );

        UPDATE public.referrals
        SET status = 'blocked',
            disqualified_reason = risk_record.reason,
            disqualified_at = now(),
            fraud_flag_id = v_fraud_flag_id,
            qualified_at = NULL,
            rewarded_at = NULL,
            points_earned = 0
        WHERE id = referral_record.id;

        RETURN NEW;
      END IF;

      UPDATE public.referrals
      SET status = 'rewarded',
          qualified_at = now(),
          rewarded_at = now(),
          points_earned = referrer_bonus
      WHERE id = referral_record.id;

      INSERT INTO public.rewards_points (user_id, total_points)
      VALUES (referral_record.referrer_id, referrer_bonus)
      ON CONFLICT (user_id)
      DO UPDATE SET
        total_points = rewards_points.total_points + referrer_bonus,
        updated_at = now();

      INSERT INTO public.rewards_points (user_id, total_points)
      VALUES (referral_record.referred_id, referred_bonus)
      ON CONFLICT (user_id)
      DO UPDATE SET
        total_points = rewards_points.total_points + referred_bonus,
        updated_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 4/5) Admin-confirmed deletion finalizer (staged + delayed deletion window)
CREATE OR REPLACE FUNCTION public.finalize_confirmed_abusive_account_deletion(p_user_id uuid, p_admin_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET account_status = 'deleted',
      enforcement_stage = 'deleted',
      deletion_confirmed_at = now()
  WHERE id = p_user_id
    AND account_status IN ('under_review', 'pending_deletion', 'locked');

  UPDATE public.fraud_flags
  SET status = 'confirmed_abuse',
      reviewed_by = p_admin_id,
      reviewed_at = now()
  WHERE user_id = p_user_id
    AND status IN ('open', 'reviewed');

  UPDATE public.fraud_review_queue
  SET queue_status = 'resolved',
      resolved_at = now(),
      assigned_admin = coalesce(assigned_admin, p_admin_id)
  WHERE user_id = p_user_id
    AND queue_status <> 'resolved';

  INSERT INTO public.deleted_accounts(email, role, reason)
  SELECT email, role::text, 'confirmed_abuse'
  FROM public.profiles
  WHERE id = p_user_id
  ON CONFLICT (email) DO UPDATE
  SET reason = excluded.reason,
      deleted_at = now();

  INSERT INTO public.fraud_enforcement_audit(user_id, action, metadata, created_by)
  VALUES (
    p_user_id,
    'permanent_deletion_confirmed',
    jsonb_build_object('admin_id', p_admin_id),
    p_admin_id
  );
END;
$$;
