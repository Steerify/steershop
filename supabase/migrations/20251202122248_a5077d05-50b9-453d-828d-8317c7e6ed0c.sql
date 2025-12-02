-- Drop ALL existing INSERT policies on orders
DROP POLICY IF EXISTS "Allow anonymous and authenticated order creation" ON public.orders;

-- Create a simple permissive policy that allows order creation
CREATE POLICY "Allow order creation"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);