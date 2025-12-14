-- Drop the existing open policy that allows customer impersonation
DROP POLICY IF EXISTS "Allow order creation" ON orders;

-- Create a secure policy that validates customer_id matches auth.uid()
CREATE POLICY "Allow order creation" ON orders
FOR INSERT WITH CHECK (
  (auth.uid() IS NULL AND customer_id IS NULL) OR
  (auth.uid() IS NOT NULL AND customer_id = auth.uid())
);