-- RLS regression tests for shop creation policies.
-- Run with: supabase test db

BEGIN;

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-00000000a001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-admin@example.com',
    crypt('password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-00000000b001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-owner@example.com',
    crypt('password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  );

INSERT INTO public.profiles (id, email, full_name, role)
VALUES
  ('00000000-0000-0000-0000-00000000a001', 'rls-admin@example.com', 'RLS Admin', 'admin'),
  ('00000000-0000-0000-0000-00000000b001', 'rls-owner@example.com', 'RLS Owner', 'shop_owner')
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

INSERT INTO public.user_roles (user_id, role)
VALUES
  ('00000000-0000-0000-0000-00000000a001', 'admin'),
  ('00000000-0000-0000-0000-00000000b001', 'shop_owner')
ON CONFLICT (user_id, role) DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', true);

INSERT INTO public.shops (
  id,
  owner_id,
  shop_name,
  shop_slug,
  is_active
)
VALUES (
  '00000000-0000-0000-0000-00000000c001',
  '00000000-0000-0000-0000-00000000b001',
  'Admin Created RLS Shop',
  'admin-created-rls-shop',
  true
);

RESET ROLE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.shops
    WHERE id = '00000000-0000-0000-0000-00000000c001'
      AND owner_id = '00000000-0000-0000-0000-00000000b001'
  ) THEN
    RAISE EXCEPTION 'Expected admin-created shop for another owner to be inserted';
  END IF;
END $$;

ROLLBACK;
