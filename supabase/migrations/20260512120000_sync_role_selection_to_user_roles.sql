-- Ensure role selection writes to profiles are mirrored to public.user_roles,
-- which is the source used by has_role() and shop RLS policies.

CREATE OR REPLACE FUNCTION public.sync_user_role_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  synced_role public.app_role;
BEGIN
  IF NEW.role IS NULL THEN
    RETURN NEW;
  END IF;

  synced_role := NEW.role::text::public.app_role;

  DELETE FROM public.user_roles
  WHERE user_id = NEW.id
    AND role <> synced_role;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, synced_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_user_role_from_profile_trigger ON public.profiles;
CREATE TRIGGER sync_user_role_from_profile_trigger
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role_from_profile();

-- Backfill any profiles that were updated while user_roles was protected from
-- client writes, including OAuth users who chose Entrepreneur but never got a
-- matching shop_owner row.
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
ON CONFLICT (user_id, role) DO NOTHING;
