
-- Ambassador tiers table
CREATE TABLE public.ambassador_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier text NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  reached_at timestamptz NOT NULL DEFAULT now(),
  reward_claimed boolean DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tier)
);

-- Enable RLS
ALTER TABLE public.ambassador_tiers ENABLE ROW LEVEL SECURITY;

-- Users can view their own tiers
CREATE POLICY "Users can view own ambassador tiers"
ON public.ambassador_tiers
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all ambassador tiers
CREATE POLICY "Admins can view all ambassador tiers"
ON public.ambassador_tiers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add reseller flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_reseller boolean DEFAULT false;
