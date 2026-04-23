-- Manual verification checklist for admin security hardening.
-- Run with a non-admin JWT session and then with an admin JWT session.

-- 1) Non-admin cannot read admin datasets.
select * from public.activity_logs limit 1;
select * from public.admin_security_alerts limit 1;

-- 2) Non-admin cannot execute admin mutations (invoke edge functions).
-- Expected: 403 Forbidden
-- supabase functions invoke admin-update-shop --no-verify-jwt false ...

-- 3) Admin can perform intended operations only.
-- Expected: 200 for valid payload, 400 for disallowed fields/enums.
-- supabase functions invoke admin-update-product ...
