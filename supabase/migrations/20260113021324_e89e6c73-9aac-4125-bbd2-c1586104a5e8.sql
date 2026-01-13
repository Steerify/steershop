-- Add KYC tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kyc_level integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS bvn_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS bvn_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS bank_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS bank_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verified_bank_account_name text;

-- Add index for quick KYC status lookups
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_level ON public.profiles(kyc_level);