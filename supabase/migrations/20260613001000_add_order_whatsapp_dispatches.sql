-- Track server-generated WhatsApp order dispatches so vendors and admins can
-- audit exactly what the system attempted to send.

CREATE TABLE IF NOT EXISTS public.order_whatsapp_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('shop_owner', 'customer')),
  recipient_phone TEXT NOT NULL,
  event_type TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'whatsapp',
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'fallback', 'failed')),
  message_body TEXT NOT NULL,
  fallback_url TEXT,
  provider_response JSONB,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_whatsapp_dispatches_order_id
  ON public.order_whatsapp_dispatches(order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_whatsapp_dispatches_status
  ON public.order_whatsapp_dispatches(status, created_at DESC);

ALTER TABLE public.order_whatsapp_dispatches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view their whatsapp dispatches" ON public.order_whatsapp_dispatches;
CREATE POLICY "Customers can view their whatsapp dispatches"
ON public.order_whatsapp_dispatches
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_whatsapp_dispatches.order_id
      AND orders.customer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Vendors can view whatsapp dispatches for their shop orders" ON public.order_whatsapp_dispatches;
CREATE POLICY "Vendors can view whatsapp dispatches for their shop orders"
ON public.order_whatsapp_dispatches
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.shops s ON s.id = o.shop_id
    WHERE o.id = order_whatsapp_dispatches.order_id
      AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can view all whatsapp dispatches" ON public.order_whatsapp_dispatches;
CREATE POLICY "Admins can view all whatsapp dispatches"
ON public.order_whatsapp_dispatches
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

COMMENT ON TABLE public.order_whatsapp_dispatches IS
'Audit trail for server-generated WhatsApp order notifications and chat handoff fallbacks.';

COMMENT ON COLUMN public.order_whatsapp_dispatches.fallback_url IS
'System-generated one-click WhatsApp handoff URL returned when direct provider delivery is unavailable.';

NOTIFY pgrst, 'reload schema';
