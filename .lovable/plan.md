
# Full Diagnosis & Refresh — Design System, Email, Backend Hardening

## What I found (audit summary)

### 1. Design / color drift (the "too many colors" problem)
- `src/index.css` defines a solid token system (`--primary`, `--accent`, `--gold`, `--brand-blue-*`, `--accent-deep`, `--accent-bright`, sidebar tokens, gradients), **but**:
  - `Index.tsx` uses **151 inline `style={{}}` blocks** with hardcoded values (`#fff`, `#25D366`, `#E1306C`, `#888`, `hsl(0,65%,45%)`, raw `rgba(...)` shadows). This bypasses the theme and is the main reason the homepage feels "many-colored".
  - **Gold/yellow leftovers**: `--gold` token, `gradient-text-gold`, `card-african::before` stripe with gold, `gold-gradient` in tailwind config, gold radial in `app-page-theme`. You said yellow is out — these need to be removed (gold kept ONLY for star ratings per the existing brand memory).
  - 40+ components still reference raw color classes (`bg-yellow-*`, `text-amber-*`, etc.) — full sweep needed.
- The new palette you gave **maps cleanly** onto the existing token names (no rename storm needed):

  | Your hex | Role | Token |
  |---|---|---|
  | `#000c44` (deep navy) | Primary brand | `--primary` (light) |
  | `#070928` | Dark bg / deep primary | `--background` (dark) |
  | `#1eb45a` | Accent — main CTA green | `--accent` (light) |
  | `#2d9759` | Accent hover / deep | `--accent-deep` |
  | `#3d6a2d` | Accent muted (badges, secondary green) | `--accent-muted` (new) |
  | `#102917` | Dark green surface | dark accent surface |
  | `#8ddd4f` | Bright accent / highlight | `--accent-bright` |
  | `#f8faf9` | Background light | `--background` (light) |
  | `#595d6a` | Muted foreground | `--muted-foreground` |
  | Black `#000` / White `#fff` | Foregrounds | unchanged |

  Result: **2 brand colors + 1 highlight + neutrals**, no yellow/gold anywhere except literal star icons.

### 2. Email pipeline — 3 different paths in production (fragile)
- `auth-email-hook` ✅ uses the correct **queue-based** pattern (`enqueue_email`) — good, works without Pro.
- `send-notification-email`, `send-welcome-email`, `order-notifications` ❌ each call **Resend directly** (`https://api.resend.com/emails`, `new Resend(...)`). This:
  - bypasses the queue (no retries, no DLQ, no rate-limit handling),
  - fails silently if `RESEND_API_KEY` is missing,
  - uses `onboarding@resend.dev` as a fallback `from` (un-deliverable in production, lands in spam),
  - means a failing Resend call blocks the user-facing flow that triggered it.
- The project already has the `enqueue_email` RPC + `process-email-queue` cron + `email_send_log`. The transactional functions should be migrated onto it.

### 3. Security / backend
- Most edge functions still ship with `verify_jwt = false` (33+ functions in `supabase/config.toml`). For functions that mutate user-owned data (`delete-account`, `paystack-create-subaccount`, `verify-identity`, `done-for-you-setup`, `done-for-you-initialize`, `migrate-images`) we need in-code JWT verification using the `SUPABASE_JWKS` secret.
- `send-phone-otp` previously leaked `devOtp` — verified removed by memory, will re-confirm.
- `paystack-webhook` uses HMAC-SHA512 of body with secret — correct per Paystack docs, will add timestamp/replay guard.
- Run `supabase--linter` and `security--run_security_scan` and resolve any new findings.

### 4. Performance / UX
- Homepage hero image is Unsplash with no `width`/`height`/`fetchPriority`, hurting LCP.
- 151 inline-style blocks force re-render on every theme change and lose dark-mode support.
- No skeleton/suspense on the heavy homepage sections (FeaturedShopsBanner, ShopperDiscovery, HomepageReviews) — they fetch in parallel and can cause layout shift.
- Bundle: `Index.tsx` is 755 lines in one file — splitting hero/sections lets Vite tree-shake.

---

## Plan (4 sprints, each independently shippable)

### Sprint A — Color system consolidation (single source of truth)
1. **Rewrite `src/index.css` tokens** to your palette:
   - Light: `--background: 150 20% 98%` (≈ `#f8faf9`), `--foreground: 230 80% 9%` (≈ `#070928`), `--primary: 230 100% 14%` (≈ `#000c44`), `--accent: 142 76% 41%` (≈ `#1eb45a`), `--accent-deep: 145 53% 38%` (≈ `#2d9759`), `--accent-muted: 99 41% 30%` (≈ `#3d6a2d`), `--accent-bright: 95 67% 59%` (≈ `#8ddd4f`), `--muted-foreground: 226 8% 39%` (≈ `#595d6a`).
   - Dark: `--background: 232 73% 9%` (≈ `#070928`), surfaces shifted from `#102917` and `#000c44`.
   - **Delete**: `--gold`, `--gold-foreground`, `gold-gradient`, `gradient-text-gold`, gold stripe in `card-african::before`, gold radial in `app-page-theme`. Keep a single `--rating: 42 90% 55%` token used **only** by `ProductRating` star fills.
2. **Update `tailwind.config.ts`** — remove `gold` color, remove `gold-gradient` background image, keep `hero-gradient` / `adire-gradient` rebuilt from primary→accent only.
3. **Refactor `src/pages/Index.tsx`**:
   - Replace every `style={{ color: "#fff", background: "#…" }}` with Tailwind classes (`text-white`, `bg-primary`, `bg-accent`, `text-accent-foreground`, etc.).
   - Replace platform dot colors with `bg-accent / bg-primary / bg-muted-foreground` semantic equivalents (drop brand-literal WhatsApp green, Instagram pink, TikTok grey from inline — keep only as small icon tints inside the platform card, sourced from token).
   - Split into `HeroSection`, `PlatformGrid`, `TrustLayer`, `VendorStories`, `FinalCTA` components (`src/components/home/*`) for readability + lazy loading.
4. **Sweep 40+ components** flagged for raw color classes (`bg-yellow-*`, `text-amber-*`, `from-yellow-*`, hex values) → token equivalents. Notable: `ReferralCard`, `SafeBeautyBadge`, `TrustBadgesSection`, `SocialProofStats`, `WhySteerSolo`, `Footer`, `Navbar`, all `kyc/*`, `marketing/*`.
5. **Verify dark/light** by visiting `/`, `/dashboard`, `/shops`, `/auth`, `/admin/dashboard` in both modes.

### Sprint B — Email reliability (works without Pro)
1. **Migrate every transactional email onto the existing queue**:
   - `send-notification-email` → enqueue to `transactional_emails` queue with `enqueue_email` RPC; remove direct Resend call.
   - `send-welcome-email` → same.
   - `order-notifications` → same (admin notify + customer confirmation both enqueued).
2. Add a single shared template renderer in `supabase/functions/_shared/email-templates/transactional/` (welcome, order-receipt, order-admin-notify, payout-status) using `@react-email/components@0.0.22` with the new SteerSolo brand (navy header, green CTA, white body — per memory).
3. Standardize `from`: use `notify@steersolo.com` (already verified per memory `integrations/auth-email-branding`). Remove `onboarding@resend.dev` fallback — fail loudly in dev instead.
4. Verify `process-email-queue` cron is running (`supabase--read_query` against `cron.job`). If missing, call `email_domain--setup_email_infra` (idempotent).
5. **End-to-end test the user flow**:
   - Sign up new user → confirmation email arrives (auth-email-hook).
   - Place test order on demo shop → admin + customer emails arrive via queue.
   - Trigger password reset → recovery email arrives.
   - Inspect `email_send_log` to confirm `sent` status for each.

### Sprint C — Backend hardening & security
1. **Auth gate sensitive functions** — flip `verify_jwt = true` for: `delete-account`, `verify-identity`, `done-for-you-setup`, `done-for-you-initialize`, `migrate-images`, `paystack-create-subaccount`, `paystack-setup-service`, `marketing-ai-assist`, `ai-bulk-product-create`, `ai-product-description`, `generate-ad-copy`, `stroke-my-shop`, `know-this-shop`, `verify-phone-otp`. Add explicit JWT verification using `SUPABASE_JWKS` where extra defense-in-depth is wanted.
2. Keep `verify_jwt = false` only for: webhooks (`paystack-webhook`, `logistics-webhook`), public OG/sitemap (`shop-og-meta`, `generate-sitemap`), `auth-email-hook`, `send-phone-otp` (rate-limited), and `paystack-list-banks` (public).
3. **Webhook hardening**: keep HMAC-SHA512 verification on `paystack-webhook`, add idempotency check using `event.id` against an existing `paystack_events` table (create if missing).
4. **Strip `devOtp` for prod** in `send-phone-otp` (re-confirm and harden — only return when `Deno.env.get('NODE_ENV') === 'development'` AND Termii key missing).
5. Run `supabase--linter` and `security--run_security_scan`; fix anything new (search-path, RLS gaps).
6. Add input validation (`zod`) to the 5 most-called functions: `paystack-initialize-order`, `done-for-you-setup`, `verify-identity`, `marketing-ai-assist`, `send-notification-email`.

### Sprint D — UX polish & performance
1. **Homepage performance**:
   - Replace Unsplash hero URLs with optimized `<img width height fetchPriority="high" decoding="async" loading="eager">` (memory `architecture/performance-optimization-strategy`).
   - Lazy-load below-the-fold sections via `React.lazy` after Sprint A's component split.
   - Add Suspense skeletons for `FeaturedShopsBanner`, `ShopperDiscovery`, `HomepageReviews`.
2. **Clarity & flow improvements** (as your UX expert):
   - Hero copy currently has 3 competing CTAs ("Get my store", platform tabs, sign-in). Reduce to **one primary CTA + one secondary** ("Start free →" / "Watch 60-sec demo").
   - Move the platform comparison (WhatsApp / Instagram / TikTok) to a single 3-up grid instead of the alternating-layout that requires scrolling on 998px viewport.
   - Add a sticky "Get started in 60 seconds" pill on scroll past hero (mobile especially — current hero CTA disappears).
   - Vendor invite CTA on homepage (currently buried) — surface in trust layer.
   - Add visible loading states on Auth submit buttons (some lack spinners).
3. **Navbar/Footer**: simplify nav from current 8+ items to 5 (`Shops`, `How it works`, `Pricing`, `Brand`, `Help`). Move `Updates`, `Ambassador`, `Growth` into footer.
4. **Run Lighthouse** post-changes; target LCP < 2.5s, CLS < 0.1.

---

## Files touched (by sprint)

**Sprint A (~25 files)**
- `src/index.css`, `tailwind.config.ts`
- `src/pages/Index.tsx` (split into `src/components/home/{Hero,PlatformGrid,TrustLayer,VendorStories,FinalCTA}.tsx`)
- ~20 components for color-class sweep

**Sprint B (~6 files)**
- `supabase/functions/send-notification-email/index.ts`
- `supabase/functions/send-welcome-email/index.ts`
- `supabase/functions/order-notifications/index.ts`
- New: `supabase/functions/_shared/email-templates/transactional/{welcome,order-receipt,order-admin-notify,payout-status}.tsx`

**Sprint C (~8 files)**
- `supabase/config.toml` (verify_jwt flips)
- 5 edge functions for zod validation + JWT checks
- New: `supabase/functions/_shared/auth.ts` (JWKS verifier)
- 1 migration if `paystack_events` idempotency table missing

**Sprint D (~6 files)**
- Homepage subcomponents from Sprint A
- `src/components/Navbar.tsx`, `src/components/Footer.tsx`
- `src/pages/Auth.tsx`

## Database changes
- **Sprint C only**: optional `paystack_events (id text primary key, received_at timestamptz default now())` for webhook idempotency. RLS: service-role only.
- No other schema changes needed.

## Risks & mitigations
- **Color sweep regression**: theme tokens already exist, mostly find-and-replace; manual QA pass on every top-level page in both themes.
- **Email migration**: keep old direct-Resend code as a feature-flagged fallback for 1 release cycle; remove after queue verified end-to-end.
- **JWT flip on functions called from anonymous flows**: audit every `supabase.functions.invoke('…')` call site for an authenticated session before flipping; functions called from sign-up flow stay open (`paystack-list-banks`, OTP sender).

## Order of execution
**Sprint A → B → C → D.** Color is most visible to users; email is most fragile; security can ship after; UX polish builds on the cleaner homepage. Each sprint is independently revertable.

## Out of scope (explicitly)
- No multi-currency / global expansion (per `AUDIT_REPORT.md` 60/90-day items).
- No new feature-phase work; no new admin pages.
- No replacing Resend with another provider (Lovable Email queue handles delivery; Resend stays as the underlying gateway via existing infra).
