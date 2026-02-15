
-- Create platform_updates table
CREATE TABLE public.platform_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'announcement',
  target_audience TEXT NOT NULL DEFAULT 'all',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.platform_updates ENABLE ROW LEVEL SECURITY;

-- Anyone can read active updates
CREATE POLICY "Anyone can view active updates"
ON public.platform_updates
FOR SELECT
USING (is_active = true);

-- Admins can manage updates
CREATE POLICY "Admins can manage updates"
ON public.platform_updates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
