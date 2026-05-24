ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS uses_own_logistics boolean NOT NULL DEFAULT false;

ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS own_logistics_note text;

COMMENT ON COLUMN public.shops.uses_own_logistics IS
'When true, shop handles delivery internally and checkout should not force external carrier selection.';

COMMENT ON COLUMN public.shops.own_logistics_note IS
'Optional vendor-provided delivery instruction shown at checkout when uses_own_logistics=true.';
