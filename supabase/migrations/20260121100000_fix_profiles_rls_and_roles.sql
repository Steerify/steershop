-- Fix profiles RLS and user_roles update access

-- 1. Update the restrictive UPDATE policy for profiles
-- This allows role changes ONLY when needs_role_selection is true
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Allow role changes if the existing row has needs_role_selection = true
      (SELECT p.needs_role_selection FROM public.profiles p WHERE p.id = auth.uid()) = true
      OR
      -- Otherwise, the role must remain the same as the current role in the database
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    )
  );

-- 2. Add INSERT policy for profiles as a fallback for OAuth signups
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Allow users to update their own role in user_roles table
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
CREATE POLICY "Users can update own role"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Ensure users can insert their own role
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
