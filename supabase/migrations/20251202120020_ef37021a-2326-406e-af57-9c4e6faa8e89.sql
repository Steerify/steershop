-- Drop the current INSERT policy
DROP POLICY IF EXISTS "Allow anonymous and authenticated order creation" ON public.orders;

-- Create a simpler INSERT policy that checks shop is active and has valid subscription inline
CREATE POLICY "Allow anonymous and authenticated order creation"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.shops s
    JOIN public.profiles p ON s.owner_id = p.id
    WHERE s.id = shop_id
    AND s.is_active = true
    AND p.subscription_expires_at > now()
  )
);