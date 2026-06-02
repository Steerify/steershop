-- Keep the public Feedback page usable while still validating anonymous inserts.
DROP POLICY IF EXISTS "Authenticated users can create feedback" ON public.platform_feedback;
DROP POLICY IF EXISTS "Public can create validated feedback" ON public.platform_feedback;

CREATE POLICY "Public can create validated feedback"
ON public.platform_feedback
FOR INSERT
TO public
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND length(trim(customer_name)) BETWEEN 2 AND 120
  AND customer_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND feedback_type IN ('complaint', 'upgrade_request', 'suggestion', 'other')
  AND length(trim(subject)) BETWEEN 3 AND 180
  AND length(trim(message)) BETWEEN 10 AND 5000
  AND (rating IS NULL OR rating BETWEEN 1 AND 5)
);
