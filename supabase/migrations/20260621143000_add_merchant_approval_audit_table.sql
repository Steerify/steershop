-- Create merchant approval audit table
CREATE TABLE IF NOT EXISTS merchant_approval_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  validated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  identity_verified_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  validation_results JSONB NOT NULL,
  identity_results JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending_validation', 'pending_verification', 'approved', 'rejected', 'manual_review')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE merchant_approval_audit ENABLE ROW LEVEL SECURITY;

-- Allow admins to read and write
CREATE POLICY "Admins can read all merchant approval audits"
  ON merchant_approval_audit
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can insert merchant approval audits"
  ON merchant_approval_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Allow shop owners to view their own audit logs
CREATE POLICY "Shop owners can view their own merchant approval audits"
  ON merchant_approval_audit
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );
