-- Keep RBAC source of truth (user_roles) aligned with profile.role
-- so has_role() checks match dashboard role assignment.

-- Remove role rows that no longer match profile.role for users with profiles.
DELETE FROM public.user_roles ur
USING public.profiles p
WHERE ur.user_id = p.id
  AND p.role IS NOT NULL
  AND ur.role <> p.role::public.app_role;

-- Backfill missing role rows from profiles.
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, p.role::public.app_role
FROM public.profiles p
LEFT JOIN public.user_roles ur
  ON ur.user_id = p.id
 AND ur.role = p.role::public.app_role
WHERE p.role IS NOT NULL
  AND ur.id IS NULL;
