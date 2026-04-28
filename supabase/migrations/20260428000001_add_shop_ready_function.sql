-- Function to determine if a shop is "ready" for the marketplace
-- A shop is ready if it has:
-- 1. A payment method set up with required details
-- 2. At least one available product with an image
CREATE OR REPLACE FUNCTION public.is_shop_ready(shop_row public.shops)
RETURNS boolean AS $$
DECLARE
  has_payment boolean := false;
  has_product boolean := false;
BEGIN
  -- Check payment setup
  IF shop_row.payment_method = 'bank_transfer' THEN
    has_payment := (shop_row.bank_name IS NOT NULL AND shop_row.bank_account_number IS NOT NULL);
  ELSIF shop_row.payment_method = 'paystack' THEN
    has_payment := (shop_row.paystack_public_key IS NOT NULL);
  ELSIF shop_row.payment_method = 'both' THEN
    has_payment := (shop_row.bank_name IS NOT NULL AND shop_row.bank_account_number IS NOT NULL AND shop_row.paystack_public_key IS NOT NULL);
  END IF;

  -- Check for products with images
  SELECT EXISTS (
    SELECT 1 FROM public.products 
    WHERE shop_id = shop_row.id 
      AND is_available = true 
      AND image_url IS NOT NULL
      AND (type IS NULL OR type = 'product') -- Strict check for products vs services if desired
  ) INTO has_product;

  RETURN (has_payment AND has_product);
END;
$$ LANGUAGE plpgsql STABLE;

-- We can also add a policy or a trigger to auto-deactivate shops that become "unready"
-- But for now, we will use this function to filter in the application.
