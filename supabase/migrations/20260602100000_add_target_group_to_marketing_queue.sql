-- Add target_group column to marketing_queue to support multiple WhatsApp groups
ALTER TABLE public.marketing_queue
ADD COLUMN IF NOT EXISTS target_group text NOT NULL DEFAULT 'marketplace'
CHECK (target_group IN ('marketplace', 'foundry', 'vendor'));

-- Create an index to quickly filter posts by target_group
CREATE INDEX IF NOT EXISTS idx_marketing_queue_target_group ON public.marketing_queue(target_group);
