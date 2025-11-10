-- Create revenue_transactions table to track all confirmed payments
CREATE TABLE public.revenue_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  payment_reference text,
  payment_method text NOT NULL DEFAULT 'paystack',
  transaction_type text NOT NULL DEFAULT 'order_payment',
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  recorded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.revenue_transactions ENABLE ROW LEVEL SECURITY;

-- Shop owners can view their own revenue transactions
CREATE POLICY "Shop owners can view own revenue"
ON public.revenue_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = revenue_transactions.shop_id
    AND shops.owner_id = auth.uid()
  )
);

-- Create index for better query performance
CREATE INDEX idx_revenue_shop_created ON public.revenue_transactions(shop_id, created_at DESC);
CREATE INDEX idx_revenue_payment_ref ON public.revenue_transactions(payment_reference) WHERE payment_reference IS NOT NULL;