-- Create a security definer function to check if shop is active
CREATE OR REPLACE FUNCTION public.shop_is_active(shop_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM shops
    WHERE id = shop_id_param 
    AND is_active = true
  );
$$;

-- Update the orders INSERT policy to use the security definer function
DROP POLICY IF EXISTS "Allow anonymous and authenticated order creation" ON orders;

CREATE POLICY "Allow anonymous and authenticated order creation"
ON orders FOR INSERT
WITH CHECK (public.shop_is_active(shop_id));