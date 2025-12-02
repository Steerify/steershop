-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Allow anonymous and authenticated order creation" ON public.orders;

-- Create policy using the SECURITY DEFINER function which bypasses RLS
CREATE POLICY "Allow anonymous and authenticated order creation"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  public.shop_has_valid_subscription(shop_id)
);