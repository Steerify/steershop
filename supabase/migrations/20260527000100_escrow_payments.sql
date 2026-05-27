-- ============================================================
-- Escrow payments: hold buyer funds on the platform balance and
-- release to the vendor only after the buyer confirms delivery.
--
-- This migration makes the escrow flow actually possible:
--   1. The orders.payment_status CHECK constraint previously rejected
--      'held_in_escrow' / 'released_from_escrow', so the existing
--      escrow functions silently failed. We widen it.
--   2. Adds escrow bookkeeping columns to orders.
--   3. Adds shops.paystack_recipient_code (needed for Paystack
--      Transfers when releasing funds to the vendor).
--   4. Adds an escrow_events audit trail.
-- Idempotent and safe to re-run.
-- ============================================================

-- 1. Allow escrow payment statuses ----------------------------------------
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_allowed_values;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_allowed_values
  CHECK (
    payment_status IS NULL
    OR payment_status IN (
      'pending',
      'paid',
      'failed',
      'cancelled',
      'refunded',
      'unpaid',
      'held_in_escrow',
      'released_from_escrow'
    )
  );

-- 2. Escrow bookkeeping columns on orders ---------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS buyer_confirmed_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS escrow_released_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS escrow_transfer_code      TEXT,
  ADD COLUMN IF NOT EXISTS escrow_transfer_reference TEXT;

-- 3. Vendor transfer recipient (created lazily on first release) ----------
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS paystack_recipient_code TEXT;

-- 4. Escrow audit trail ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.escrow_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shop_id     UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  event       TEXT NOT NULL CHECK (event IN ('held', 'release_requested', 'released', 'release_failed', 'refunded')),
  amount_ngn  NUMERIC(12,2),
  reference   TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_escrow_events_order_id ON public.escrow_events(order_id);

ALTER TABLE public.escrow_events ENABLE ROW LEVEL SECURITY;

-- Buyers can read the escrow trail for their own orders
DROP POLICY IF EXISTS "Buyers can view their escrow events" ON public.escrow_events;
CREATE POLICY "Buyers can view their escrow events"
ON public.escrow_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = escrow_events.order_id
      AND orders.customer_id = auth.uid()
  )
);

-- Shop owners can read the escrow trail for their shop's orders
DROP POLICY IF EXISTS "Vendors can view their escrow events" ON public.escrow_events;
CREATE POLICY "Vendors can view their escrow events"
ON public.escrow_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = escrow_events.shop_id
      AND shops.owner_id = auth.uid()
  )
);

-- Writes happen only from edge functions using the service role,
-- which bypasses RLS. No INSERT policy is granted to end users.

NOTIFY pgrst, 'reload schema';
