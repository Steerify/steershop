
-- Create tutorial_collections table
CREATE TABLE public.tutorial_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutorial_collections ENABLE ROW LEVEL SECURITY;

-- Admins can manage collections
CREATE POLICY "Admins can manage tutorial collections"
ON public.tutorial_collections FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active collections
CREATE POLICY "Anyone can view active tutorial collections"
ON public.tutorial_collections FOR SELECT
USING (is_active = true);

-- Add collection_id to courses
ALTER TABLE public.courses ADD COLUMN collection_id UUID REFERENCES public.tutorial_collections(id) ON DELETE SET NULL;

-- Add social_links JSONB to courses
ALTER TABLE public.courses ADD COLUMN social_links JSONB DEFAULT '{}';
