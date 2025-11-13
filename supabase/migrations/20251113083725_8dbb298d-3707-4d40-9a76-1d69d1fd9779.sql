-- Create a security definer function to check if a shop has valid subscription
CREATE OR REPLACE FUNCTION public.shop_has_valid_subscription(shop_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM shops s
    JOIN profiles p ON s.owner_id = p.id
    WHERE s.id = shop_id_param
    AND s.is_active = true
    AND (
      -- Active paid subscription
      (p.is_subscribed = true AND p.subscription_expires_at > now())
      OR
      -- Active trial period
      (p.is_subscribed = false AND p.subscription_expires_at > now())
    )
  );
$$;

-- Drop and recreate the products policy using the security definer function
DROP POLICY IF EXISTS "Anyone can view products from active shops" ON products;

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
  -- Anyone can see products from shops with valid subscriptions
  public.shop_has_valid_subscription(products.shop_id)
);