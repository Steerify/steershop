CREATE TABLE IF NOT EXISTS store_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, shop_id)
);

ALTER TABLE store_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own store follows"
  ON store_follows
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own store follows"
  ON store_follows
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own store follows"
  ON store_follows
  FOR DELETE
  USING (auth.uid() = user_id);
