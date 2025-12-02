-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Allow anonymous and authenticated order creation" ON public.orders;

-- Create policy with correct role specification for Supabase
CREATE POLICY "Allow anonymous and authenticated order creation"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.shops s
    JOIN public.profiles p ON s.owner_id = p.id
    WHERE s.id = orders.shop_id
    AND s.is_active = true
    AND p.subscription_expires_at > now()
  )
);