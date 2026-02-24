-- Extend subscription for user sharonohuche294@gmail.com
-- This will make their shop "sharie-luxe-store" publicly visible again

UPDATE profiles
SET 
  is_subscribed = true,
  subscription_expires_at = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE email = 'sharonohuche294@gmail.com';

-- Verify the update
SELECT 
  email,
  is_subscribed,
  subscription_expires_at,
  subscription_expires_at > NOW() as is_valid,
  updated_at
FROM profiles
WHERE email = 'sharonohuche294@gmail.com';
