-- Drop the incorrect policy
DROP POLICY IF EXISTS "Allow anonymous and authenticated order creation" ON public.orders;

-- Create the corrected policy using shop_has_valid_subscription
CREATE POLICY "Allow anonymous and authenticated order creation"
ON public.orders
FOR INSERT
TO public
WITH CHECK (public.shop_has_valid_subscription(shop_id));