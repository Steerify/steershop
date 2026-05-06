-- Add SEO columns to shops table for AI DNA Generator
ALTER TABLE shops ADD COLUMN IF NOT EXISTS seo_keywords text[];
ALTER TABLE shops ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS seo_metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS seo_dna_updated_at timestamptz;

-- Add index for SEO searching (future scalability)
CREATE INDEX IF NOT EXISTS idx_shops_seo_keywords ON shops USING GIN (seo_keywords);
