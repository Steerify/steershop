-- Add INSERT policy for shop owners to record revenue transactions
CREATE POLICY "Shop owners can insert revenue"
ON public.revenue_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = revenue_transactions.shop_id
    AND shops.owner_id = auth.uid()
  )
);