-- Trusted role-selection path for OAuth signups and other users that still
-- need to choose their initial application role.

CREATE OR REPLACE FUNCTION public.select_user_role(p_role public.app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_needs_role_selection boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '28000';
  END IF;

  IF p_role NOT IN ('customer'::public.app_role, 'shop_owner'::public.app_role) THEN
    RAISE EXCEPTION 'Invalid role selection'
      USING ERRCODE = '22023';
  END IF;

  SELECT p.needs_role_selection
    INTO v_needs_role_selection
  FROM public.profiles AS p
  WHERE p.id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_needs_role_selection IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Role selection is not pending for this profile'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.profiles
  SET role = p_role::text::public.user_role,
      needs_role_selection = false,
      updated_at = now()
  WHERE id = v_user_id;

  DELETE FROM public.user_roles
  WHERE user_id = v_user_id
    AND role <> p_role;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, p_role)
  ON CONFLICT (user_id, role)
  DO UPDATE SET role = EXCLUDED.role;

  RETURN jsonb_build_object(
    'user_id', v_user_id,
    'role', p_role,
    'needs_role_selection', false
  );
END;
$$;

REVOKE ALL ON FUNCTION public.select_user_role(public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.select_user_role(public.app_role) TO authenticated;

-- Backfill existing role mismatches so RBAC checks match profiles.role.
DELETE FROM public.user_roles ur
USING public.profiles p
WHERE ur.user_id = p.id
  AND p.role IS NOT NULL
  AND ur.role <> p.role::text::public.app_role;

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, p.role::text::public.app_role
FROM public.profiles p
LEFT JOIN public.user_roles ur
  ON ur.user_id = p.id
 AND ur.role = p.role::text::public.app_role
WHERE p.role IS NOT NULL
  AND ur.id IS NULL
ON CONFLICT (user_id, role)
DO NOTHING;
