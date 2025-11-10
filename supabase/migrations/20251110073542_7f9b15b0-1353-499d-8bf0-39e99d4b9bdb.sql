-- Add subscription pricing fields to special_offers table
ALTER TABLE public.special_offers
ADD COLUMN IF NOT EXISTS subscription_price integer,
ADD COLUMN IF NOT EXISTS original_price integer DEFAULT 100000,
ADD COLUMN IF NOT EXISTS applies_to_subscription boolean DEFAULT false;

-- Update existing offers to have default values
UPDATE public.special_offers
SET original_price = 100000
WHERE original_price IS NULL;

COMMENT ON COLUMN public.special_offers.subscription_price IS 'Final subscription price in kobo (Nigerian smallest currency unit). If null, use original_price minus discount.';
COMMENT ON COLUMN public.special_offers.original_price IS 'Original subscription price in kobo (default: 100000 = ₦1,000)';
COMMENT ON COLUMN public.special_offers.applies_to_subscription IS 'Whether this offer applies to subscription payments';