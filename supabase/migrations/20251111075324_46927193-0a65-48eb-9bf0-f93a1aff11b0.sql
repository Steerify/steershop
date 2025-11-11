-- Add admin policy to view all shops
CREATE POLICY "Admins can view all shops"
ON shops
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update shop owner view policy to ensure it works correctly
DROP POLICY IF EXISTS "Shop owners can view own shop details" ON shops;

CREATE POLICY "Shop owners can view own shop details"
ON shops
FOR SELECT
USING (
  (auth.uid() = owner_id) 
  AND has_role(auth.uid(), 'shop_owner'::app_role)
);