ALTER TABLE public.setup_requests
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS business_category TEXT,
  ADD COLUMN IF NOT EXISTS product_summary TEXT,
  ADD COLUMN IF NOT EXISTS product_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_setup BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_setup_requests_user_email ON public.setup_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_setup_requests_free_setup ON public.setup_requests(free_setup);
