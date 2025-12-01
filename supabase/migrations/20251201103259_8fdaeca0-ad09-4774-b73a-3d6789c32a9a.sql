-- Drop the existing INSERT policy for orders
DROP POLICY IF EXISTS "Allow anonymous and authenticated order creation" ON public.orders;

-- Recreate the policy with properly schema-qualified function
CREATE POLICY "Allow anonymous and authenticated order creation"
ON public.orders
FOR INSERT
TO public
WITH CHECK (public.shop_is_active(shop_id));