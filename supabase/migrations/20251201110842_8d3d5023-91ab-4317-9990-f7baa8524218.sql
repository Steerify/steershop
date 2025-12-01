-- Drop the incorrect policy
DROP POLICY IF EXISTS "Allow anonymous and authenticated order creation" ON public.orders;

-- Create the corrected policy with proper schema prefix
CREATE POLICY "Allow anonymous and authenticated order creation"
ON public.orders
FOR INSERT
TO public
WITH CHECK (public.shop_is_active(shop_id));