-- Update products RLS policy to check subscription status
DROP POLICY IF EXISTS "Anyone can view products from active shops" ON public.products;

CREATE POLICY "Anyone can view products from active shops with valid subscriptions"
ON public.products
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM shops s
    INNER JOIN profiles p ON s.owner_id = p.id
    WHERE s.id = products.shop_id
      AND s.is_active = true
      AND (
        -- Active paid subscription
        (p.is_subscribed = true AND p.subscription_expires_at > now())
        OR
        -- Active trial period
        (p.is_subscribed = false AND p.subscription_expires_at > now())
        OR
        -- Or the viewer is the shop owner (for shop owner to manage their products)
        s.owner_id = auth.uid()
      )
  )
);