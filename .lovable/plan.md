## Why signup emails aren't arriving

Your `auth-email-hook` Edge Function exists and the Resend transport works (we verified Resend separately last session). The actual problem: signup/verification emails are still being sent by Supabase Auth's default sender because the `auth-email-hook` is **not registered as the "Send Email" auth hook** in the backend. Resend is never invoked for these flows. That's why test emails to `reginaomasoro56@gmail.com` worked but the signup verification email for `okechukwuchukwufulumnanya10@gmail.com` never arrived.

`RESEND_API_KEY`, `WEBHOOK_SECRET`, and the function deployment are all already in place — we just need to wire them up and stop relying on Supabase's default SMTP.

---

## Plan

### 1. Make Resend the real auth email sender
- Register `auth-email-hook` as the Supabase Auth **Send Email Hook** (URI + `WEBHOOK_SECRET`) via migration so signup/recovery/magic-link/email-change/reauth emails all flow through Resend.
- Harden `auth-email-hook`: explicit Resend-first transport, structured logging of `messageId` + recipient, and a graceful 500 with reason if Resend rejects (instead of silent failure).
- Audit every non-auth send site (`order-notifications`, `send-welcome-email`, `send-password-reset`, `send-notification-email`, `smtp-verify`) to confirm they import `_shared/smtp.ts` (which already prefers Resend). Fix any stragglers.
- Send a live signup test to a fresh address after deploy and confirm a `sent` row appears in Resend's dashboard + the verification link works end-to-end.

### 2. Auth pages — fill the empty space professionally
The login card and the "Check Your Email" card both leave the right ~60% of the desktop screen blank. Add a **left/right brand panel** (visible on `md+` only, hidden on mobile so mobile stays clean):
- SteerSolo wordmark + tagline ("Nigeria's trusted marketplace for verified shops")
- 3 trust bullets: SafeBeauty verified · Escrow-protected payments · NGN-native
- A subtle Adire pattern background using the existing `AdirePattern` component
- Small live stat ("X approved shops · Y orders processed") pulled from the same query the homepage uses

Applies to `Auth.tsx`, the "Check Your Email" confirmation screen, and `ResetPassword.tsx` for consistency.

### 3. First-visit intros on major pages
Add a lightweight, one-time popup (stored in `localStorage` per page key, dismissible, never re-shows) on first visit to:
- **`/shops` (Explore Marketplace)** — what the marketplace is, how SafeBeauty tiers work, how to filter
- **`/discovery` (Discovery Hub)** — what trending/featured means, how merchants get listed
- **`/dashboard`** (merchant first login) — quick orientation to Products / Orders / Marketing
- **`/customer/dashboard`** (shopper first login) — orders, wishlist, rewards

Single reusable `FirstVisitIntro` component (modal-style, branded, with "Got it" CTA) so we don't duplicate logic. Skips automatically if `localStorage[`intro_seen_${pageKey}`]` is set.

### 4. Declutter the homepage
Audit `src/pages/Index.tsx` and remove duplicates/redundancy while keeping the SteerSolo story tight:
- Merge the two trust-signal sections (`TrustBadges` + `TrustBadgesSection`) into one
- Remove duplicate "Why SteerSolo" if it appears alongside `WhySteerSolo` content
- Collapse repeated CTAs ("Start selling" appears in hero, mid-page, and `FinalCTASection`) down to **hero + final** only
- Remove any section that doesn't directly answer: *What is SteerSolo? · Who is it for? · How does it work? · Proof it works · Start now*
- Keep: Hero, Live stats, How it works, Featured Stores carousel, Social proof/reviews, Final CTA, Footer

I'll do this as a surgical pass — listing exactly which sections get removed in the diff, not a rewrite.

---

## Technical notes

- Auth hook registration: SQL migration setting `auth.config` (`hook_send_email_enabled = true`, `hook_send_email_uri = <function URL>`, secret from `WEBHOOK_SECRET`). Reversible.
- No changes to `src/integrations/supabase/client.ts` or `supabase/config.toml` project-level settings.
- `FirstVisitIntro` uses Radix Dialog (already in the project) — zero new deps.
- Homepage cleanup is presentation-only; no service/data changes.

Want me to proceed?