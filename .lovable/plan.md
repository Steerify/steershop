
# Audit Fixes and Admin Ads Management

Based on the audit report, here are the actionable fixes I can implement now, plus the admin ads feature you requested.

---

## 1. Security: Remove devOtp Leakage (Critical)

**Problem:** The `send-phone-otp` edge function returns the raw OTP in the response (`devOtp`) when the Termii API key is missing or short. The frontend (`PhoneVerification.tsx`) displays it in a yellow banner. If Termii is ever misconfigured in production, OTPs are exposed to any caller.

**Fix:**
- Remove `devOtp` from the edge function response entirely -- only log it server-side
- Remove the dev OTP display from `PhoneVerification.tsx`

**Files:** `supabase/functions/send-phone-otp/index.ts`, `src/components/auth/PhoneVerification.tsx`

---

## 2. Security: Fix Paystack Webhook HMAC Verification (Critical)

**Problem:** The current webhook computes `SHA-512(secretKey + body)` -- a plain hash, not an HMAC. Paystack's docs specify `HMAC-SHA512(body, secretKey)`. This means signature verification may silently pass or fail incorrectly.

**Fix:** Replace `crypto.subtle.digest('SHA-512', ...)` with proper `crypto.subtle.importKey` + `crypto.subtle.sign('HMAC', ...)` using the Paystack secret key.

**File:** `supabase/functions/paystack-webhook/index.ts`

---

## 3. Security: Reduce Verbose Auth Logging (Medium)

**Problem:** `AuthContext.tsx` logs database role values and mapped roles to the browser console, exposing role/profile info.

**Fix:** Remove `console.log('Database role value:')` and `console.log('Mapped UserRole:')` lines from `AuthContext.tsx`.

**File:** `src/context/AuthContext.tsx`

---

## 4. Admin Ads Management Feature

**What you asked:** As an admin, you want to create ads that automatically work on social media.

**How it will work:**
- Add an "Ads Manager" page to the admin panel at `/admin/ads`
- Admin can create ad campaigns by selecting a shop (or all shops), choosing platforms, entering promo text or letting AI generate it
- The page uses the existing `generate-ad-copy` edge function for AI copy generation
- For each platform, it generates ready-to-post content and provides one-click actions:
  - **WhatsApp:** Opens WhatsApp share with pre-filled text
  - **Facebook/Instagram:** Copies formatted post + opens Facebook Ads Manager
  - **TikTok:** Copies script + opens TikTok Ads
  - **Google:** Copies ad copy + opens Google Ads
- Admin can also create "bulk campaigns" for featured/top shops

**Files to create:**
- `src/pages/admin/AdminAds.tsx` -- Full admin ads management page

**Files to modify:**
- `src/components/AdminSidebar.tsx` -- Add "Ads Manager" menu item
- `src/App.tsx` -- Add `/admin/ads` route

---

## Technical Summary

| Priority | Area | File(s) | Change |
|----------|------|---------|--------|
| Critical | Security | `send-phone-otp/index.ts`, `PhoneVerification.tsx` | Remove devOtp from response and UI |
| Critical | Security | `paystack-webhook/index.ts` | Fix HMAC-SHA512 signature verification |
| Medium | Security | `AuthContext.tsx` | Remove PII console.log statements |
| Feature | Admin | `AdminAds.tsx` (new), `AdminSidebar.tsx`, `App.tsx` | Admin Ads Manager with AI generation and social media deep-links |
