-- Allow admins to view all profiles (needed for shop owner data)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all profiles (for subscription management)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all shops
CREATE POLICY "Admins can update all shops"
  ON public.shops FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete shops
CREATE POLICY "Admins can delete shops"
  ON public.shops FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage all products
CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));