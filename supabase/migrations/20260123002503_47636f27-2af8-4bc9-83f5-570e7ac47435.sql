-- Add shop appearance customization columns
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#D4AF37',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#2E1A47',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#FF6B35',
ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS font_style TEXT DEFAULT 'modern';

-- Add check constraints for valid values
ALTER TABLE public.shops 
ADD CONSTRAINT shops_theme_mode_check CHECK (theme_mode IN ('light', 'dark', 'auto')),
ADD CONSTRAINT shops_font_style_check CHECK (font_style IN ('modern', 'classic', 'playful', 'elegant'));