# SteerShop / SteerSolo Audit Report

## Scope
- Codebase scan across frontend, Supabase edge functions, deployment config, and product messaging.
- Operational readiness review for customer satisfaction/retention and global market viability.
- Offer-strategy framing inspired by value-first “$100M offer” principles (dream outcome, speed, certainty, low friction).

## Executive summary
SteerSolo has strong positioning for WhatsApp-first commerce and clear value messaging for Nigerian SMEs. However, there are material gaps in production hardening, trust controls, and internationalization readiness that can directly hurt conversion and retention if not addressed.

## Critical technical and operational risks

### 1) Broad unauthenticated edge-function surface
- Many Supabase functions are configured with `verify_jwt = false`, including payment, OTP, logistics, AI, and account-adjacent functions.
- **Risk:** increases abuse, unauthorized invocation, and billing/infra blowups if per-function verification and stricter server-side checks are not consistently enforced.

### 2) Weak webhook verification implementation pattern
- `paystack-webhook` computes a SHA-512 digest over `secret + body` and compares to `x-paystack-signature`.
- **Risk:** signature validation logic may diverge from provider HMAC expectations, creating false negatives/positives and payment-state inconsistency.

### 3) OTP leakage in non-Termii paths
- `send-phone-otp` returns `devOtp` in response when Termii key is missing.
- **Risk:** OTP disclosure can become a security bypass if misconfigured environment reaches production-like traffic.

### 4) Sensitive logging and noisy auth telemetry
- Auth flow logs role/profile/session state extensively in browser and function handlers.
- **Risk:** PII and auth metadata exposure in logs, harder incident triage, and poor compliance posture at scale.

### 5) Quality gate not healthy
- Lint currently fails with hundreds of violations.
- **Risk:** reliability regressions, slower dev velocity, and weaker change confidence.

## Market viability (global) assessment

### Current viability
- **Strong for Nigeria + WhatsApp commerce:** messaging, pricing, payment rails, and examples are tightly localized.
- **Limited globally today:** hardcoded market language, NGN-only cues, and Nigeria-first schema metadata limit universal positioning.

### Evidence-backed blockers to global expansion
1. Nigeria-first brand/content markers are deeply embedded (homepage + schemas).
2. Currency and payment narratives are predominantly NGN/Paystack-centric.
3. Environment/deployment values are tightly coupled to one Supabase project and domain paths.

## Customer satisfaction & retention gaps

### Where churn can happen now
- Onboarding may feel value-heavy but proof-light (strong claims, weaker quantified milestones).
- Trust posture can be undermined by security/config inconsistencies.
- Reliability issues can surface due to weak lint hygiene and high warning debt.

### Retention improvements to prioritize
1. **Activation certainty:** first-24-hour checklist with measurable wins (store live, first lead/order, payment test pass).
2. **Operational trust:** payment/webhook observability dashboard + customer-visible delivery/payment status transparency.
3. **Support speed:** in-app guided fixes for top failure modes (payment failed, OTP delayed, order stuck).
4. **Habit loop:** weekly “growth brief” with actionable suggestions and one-click campaign execution.

## “$100M offer” style upgrade opportunities

### Dream outcome (bigger, clearer)
- Shift promise from “look professional” to “get predictable weekly orders from social channels with less DM chaos.”

### Increase perceived likelihood
- Introduce concrete guarantee framework:
  - “Go-live in 60 minutes or we set it up free.”
  - “First 10 qualified order intents in 14 days or next month free.”

### Reduce time delay
- Launch template packs by niche (fashion, food, beauty, services) with prebuilt conversion journeys.

### Reduce effort/sacrifice
- One-click migration from WhatsApp catalog/Instagram highlights into store listings.

### Offer architecture recommendation
- **Core:** Store + payment + order ops.
- **Value stack:** AI creative, trust badges, abandoned-cart nudges, delivery visibility.
- **Risk reversal:** setup and performance guarantees.
- **Urgency:** limited cohort onboarding support each month.

## Prioritized 30/60/90 plan

### First 30 days (must-fix)
1. Lock down function auth model (`verify_jwt` true where possible, signed/internal allowlists where not).
2. Standardize webhook signature verification to provider docs + replay protection.
3. Remove `devOtp` from responses outside explicit local dev mode.
4. Add production log policy (no PII in client logs, structured server logs).

### 60 days (scale readiness)
1. Introduce multi-currency display and localized checkout abstractions.
2. Add payment-provider abstraction beyond Paystack for target regions.
3. Improve CI quality gates (lint budgets, typed domain models, regression checks).

### 90 days (global GTM)
1. Geo-personalized landing pages (currency, language, testimonials, local rails).
2. Country-specific compliance and trust pages.
3. Customer success playbooks by segment (new seller, scaling seller, service-based seller).

## KPI suggestions
- Activation: `% of signups live with >=5 products in 24h`.
- Conversion: `trial -> paid` by channel and segment.
- Retention: logo retention at 30/90 days and cohort MRR retention.
- Trust: payment success rate, OTP success latency, support first-response and resolution time.
- Advocacy: referral rate and NPS.

## Conclusion
The product concept is viable and compelling for WhatsApp-first sellers, but global competitiveness requires immediate security/operations hardening, stronger proof-based onboarding, and market-localized monetization/positioning layers.
