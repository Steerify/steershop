-- Harden payment-related data integrity constraints.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_total_amount_non_negative'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_total_amount_non_negative
      CHECK (total_amount >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_payment_status_allowed_values'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_payment_status_allowed_values
      CHECK (
        payment_status IS NULL
        OR payment_status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'revenue_transactions_amount_non_negative'
      AND conrelid = 'public.revenue_transactions'::regclass
  ) THEN
    ALTER TABLE public.revenue_transactions
      ADD CONSTRAINT revenue_transactions_amount_non_negative
      CHECK (amount >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'revenue_transactions_platform_fee_non_negative'
      AND conrelid = 'public.revenue_transactions'::regclass
  ) THEN
    ALTER TABLE public.revenue_transactions
      ADD CONSTRAINT revenue_transactions_platform_fee_non_negative
      CHECK (platform_fee_amount IS NULL OR platform_fee_amount >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'revenue_transactions_net_amount_non_negative'
      AND conrelid = 'public.revenue_transactions'::regclass
  ) THEN
    ALTER TABLE public.revenue_transactions
      ADD CONSTRAINT revenue_transactions_net_amount_non_negative
      CHECK (net_amount IS NULL OR net_amount >= 0);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_reference_unique
  ON public.orders (payment_reference)
  WHERE payment_reference IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_transactions_payment_reference_unique
  ON public.revenue_transactions (payment_reference)
  WHERE payment_reference IS NOT NULL;
