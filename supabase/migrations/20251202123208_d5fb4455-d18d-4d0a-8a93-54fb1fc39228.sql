-- Force drop and recreate the INSERT policy with explicit PERMISSIVE
DROP POLICY IF EXISTS "Allow order creation" ON public.orders;
DROP POLICY IF EXISTS "Allow anonymous and authenticated order creation" ON public.orders;

-- Recreate as explicitly PERMISSIVE for ALL users
CREATE POLICY "Allow order creation"
ON public.orders
FOR INSERT
TO public
WITH CHECK (true);