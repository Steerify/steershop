-- First ensure the shop_is_active function exists
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

-- Drop and recreate the orders INSERT policy with proper anonymous user support
DROP POLICY IF EXISTS "Allow anonymous and authenticated order creation" ON orders;

CREATE POLICY "Allow anonymous and authenticated order creation"
ON orders FOR INSERT
WITH CHECK (
  -- Allow if shop is active (using security definer function)
  public.shop_is_active(shop_id)
);