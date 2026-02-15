
# Grand Offer & Value Refinement -- Implementation Plan

## Audit of What Already Works

| Feature | Status | Notes |
|---------|--------|-------|
| Store creation & management | Working | MyStore.tsx, shop.service.ts |
| WhatsApp order routing | Working | utils/whatsapp.ts, checkout flow |
| Paystack payments | Working | Edge functions, webhook verification |
| Subscriptions (Basic/Pro/Business) | Working | Paystack billing, auto-renewal |
| Orders & tracking | Working | Orders.tsx, order timeline |
| Logistics integration | Working | Terminal Africa, Sendbox, manual fallback via edge functions |
| AI features (Stroke My Shop, Know This Shop) | Working | Edge functions with Lovable AI |
| Ambassador Program | Working | Just built -- tiers, edge function, Ambassador.tsx |
| QR code & flyer generation | Working | StoreFlyerTemplate.tsx |
| Trust badges (homepage) | Working | TrustBadgesSection.tsx |
| Store share (copy link, WhatsApp, QR) | Working | MyStore.tsx share section |
| Invoice generation | Working | InvoiceTemplate.tsx |
| Customer CRM | Working | Customers.tsx |
| AI product descriptions | Working | ai-product-description edge function |

## What Needs Fixing

### 1. Entrepreneur Signup Redirects to Customer Dashboard (BUG)
**Root cause:** In `Auth.tsx` (line 110), after login the redirect uses `getDashboardPath(user.role)` which returns `/dashboard` for entrepreneurs. But this happens before `onboardingCompleted` is checked. The `ProtectedRoute` also doesn't intercept entrepreneurs who haven't completed onboarding.

**Fix:**
- In `Auth.tsx`: After login, check `user.onboardingCompleted`. If user is ENTREPRENEUR and `onboardingCompleted === false`, redirect to `/onboarding` instead of `/dashboard`.
- In `ProtectedRoute.tsx`: When an ENTREPRENEUR accesses `/dashboard` without completing onboarding, redirect to `/onboarding`.

### 2. Empty Name After Manual Email Signup (BUG)
**Root cause:** The signup form sends `firstName: ""` and `lastName: ""`, so `full_name` in user metadata becomes `" "` (a space). The `handle_new_user` trigger checks for empty/null but a single space passes that check.

**Fix:**
- Update the `handle_new_user` database trigger to trim the `full_name` before checking if it's empty, ensuring the email prefix fallback activates properly.
- Update `Dashboard.tsx` greeting to gracefully handle empty/whitespace-only names by falling back to email prefix.

## What's New (From the Grand Offer Brief)

### 3. Homepage Repositioning to WhatsApp-First Messaging
Update the hero section and key messaging to align with the brief's positioning: "WhatsApp-first selling engine."

**Changes to `Index.tsx`:**
- Hero tagline: "Turn your WhatsApp business into a professional store in 10 minutes"
- Typewriter texts: "Get a store link", "Accept payments securely", "Send orders to WhatsApp", "Build customer trust", "Grow with AI tools"
- Sub-headline: "SteerSolo helps WhatsApp sellers look professional, build trust instantly, and close sales faster -- without building a website."
- Trust signals below CTA: "10-minute setup", "No website needed", "WhatsApp-powered"
- Risk reversal text: "If SteerSolo doesn't make your business look more professional, you don't pay."

### 4. "Done-For-You" Toggle in Onboarding
Add a prominent option during the onboarding survey for sellers to request a done-for-you store setup.

**Changes to `Onboarding.tsx`:**
- Add a card at the top of the questions step: "Want us to set up your store for you?" with a toggle/button
- When selected, store `setup_preference: 'done_for_you'` in `onboarding_responses`
- Show confirmation: "Our team will set up your store within 24 hours. We'll WhatsApp you when it's ready."

**Database:** Add `setup_preference` column to `onboarding_responses` table.

### 5. First-Sale Momentum Guidance
After completing onboarding/store setup, show a motivational nudge on the Dashboard.

**Changes to `Dashboard.tsx`:**
- When `totalSales === 0` and shop exists, show a prominent card: "Your first sale usually happens within 48 hours if you share your store link"
- Include one-tap share buttons (WhatsApp Status, copy link)
- Psychological anchoring with a countdown or progress indicator

### 6. Delivery/Logistics Question in Onboarding Survey
Add a required question about delivery preferences.

**Changes to `Onboarding.tsx`:**
- Add Q5 (required): "How do you handle delivery?"
- Options: "I deliver myself", "I use a logistics company", "I need help with delivery", "Customers pick up from me"
- Update progress bar to show 5 required questions instead of 4

**Changes to `onboarding.service.ts`:**
- Add `deliveryMethod` to `OnboardingData` interface

**Database:** The `onboarding_responses` table already has a `delivery_method` column.

### 7. Remove "ecommerce" Language and Reduce Feature Overload
Audit and update copy across the homepage and key pages.

**Changes:**
- `WhySteerSolo.tsx`: Update heading to "From WhatsApp chats to a real store" and simplify comparison table
- `Index.tsx`: Remove technical jargon, shorten value proposition descriptions
- Ensure no page says "ecommerce platform" -- replace with "selling engine" or "business platform"

---

## Technical Details

### Database Migration
```text
-- Add setup_preference to onboarding_responses
ALTER TABLE public.onboarding_responses 
ADD COLUMN IF NOT EXISTS setup_preference text DEFAULT NULL;

-- Fix handle_new_user trigger to trim full_name properly
CREATE OR REPLACE FUNCTION public.handle_new_user() ...
  -- TRIM(user_full_name) check instead of just NULL check
```

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Fix redirect: check onboardingCompleted before sending ENTREPRENEUR to /dashboard |
| `src/components/ProtectedRoute.tsx` | Redirect entrepreneurs without onboarding to /onboarding |
| `src/pages/Dashboard.tsx` | Add first-sale momentum card; fix empty name greeting |
| `src/pages/Index.tsx` | WhatsApp-first hero messaging, risk reversal, simplified copy |
| `src/components/WhySteerSolo.tsx` | "From WhatsApp chats to a real store" positioning |
| `src/pages/entrepreneur/Onboarding.tsx` | Add "Done-For-You" toggle + delivery question (Q5) |
| `src/services/onboarding.service.ts` | Add deliveryMethod + setupPreference fields |
| Database migration | Add setup_preference column, fix handle_new_user trigger |

### Auth Flow After Fix

```text
User signs up as Entrepreneur
  -> Email verification
  -> Login
  -> Auth.tsx checks: is ENTREPRENEUR + onboardingCompleted === false?
     -> YES: redirect to /onboarding
     -> NO: redirect to /dashboard

User hits /dashboard directly (via ProtectedRoute)
  -> ProtectedRoute checks: is ENTREPRENEUR + onboardingCompleted === false?
     -> YES: redirect to /onboarding
     -> NO: render Dashboard
```

### Onboarding Flow After Update

```text
Step 1: Phone verification (skip for customers)
Step 2: Survey questions
  - [NEW] Done-For-You toggle card at top
  - Q1: Business type
  - Q2: Customer source
  - Q3: Biggest struggle
  - Q4: Payment method
  - Q5: [NEW] Delivery method (required)
  - Q6: Perfect feature (optional)
-> Submit -> Redirect to /dashboard
```
