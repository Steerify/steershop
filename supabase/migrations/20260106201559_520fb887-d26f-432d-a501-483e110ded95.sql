-- Add public SELECT policy for active shops with valid subscriptions
CREATE POLICY "Anyone can view active shops with subscriptions"
ON public.shops
FOR SELECT
TO public
USING (
  is_active = true 
  AND shop_has_valid_subscription(id)
);