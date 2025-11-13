-- Drop existing policy that blocks anonymous users
DROP POLICY IF EXISTS "Anyone can view products from active shops with valid subscript" ON products;

-- Create new policy that allows anonymous users to view products
CREATE POLICY "Anyone can view products from active shops"
ON products FOR SELECT
USING (
  -- Shop owners can always see their own products
  (EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = products.shop_id 
    AND shops.owner_id = auth.uid()
  ))
  OR
  -- Anyone (including anonymous) can see products from active shops with valid subscriptions
  (EXISTS (
    SELECT 1
    FROM shops s
    JOIN profiles p ON s.owner_id = p.id
    WHERE s.id = products.shop_id
    AND s.is_active = true
    AND (
      -- Active paid subscription
      (p.is_subscribed = true AND p.subscription_expires_at > now())
      OR
      -- Active trial period
      (p.is_subscribed = false AND p.subscription_expires_at > now())
    )
  ))
);