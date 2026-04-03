

# SteerSolo Domination Plan — Step-by-Step Implementation Roadmap

## Documents Summary

You have two comprehensive strategy documents:
1. **Online Vendor Domination Plan** — 12-phase execution from brand positioning to diaspora expansion, targeting Nigeria's $14.5B e-commerce market and 39M online vendors
2. **Beauty Dominance Playbook** — Beauty-specific version with SafeBeauty verification system, NAFDAC alignment, and the $10.17B Nigerian beauty market

Both documents share the same architecture: Trust Infrastructure → Vendor Onboarding → Content Engine → Community → Monetisation → Diaspora Expansion.

## What's Already Built vs What's Needed

### Already Built (Platform Foundation)
- Shop creation, product listings, store pages with slugs
- 5-layer trust system (verification, badges, reviews, ratings)
- SafeBeauty badge system in UI
- Subscription tiers (Starter/Growth/Pro)
- Paystack payments, bank transfer
- WhatsApp integration (share links, order notifications)
- Customer/Entrepreneur roles, onboarding flow
- Admin dashboard with shop approval workflow
- SEO pages, sitemap generation
- Ambassador/referral system
- KYC verification (Level 1 & 2)
- Delivery tracking, order management

### Gaps — What the Documents Require That's Missing

The documents are largely **marketing/operations playbooks**, not feature specs. Most of the 12 phases are about content creation, social media posting, and manual outreach — not code. However, several **platform features** are referenced that we should verify or build.

---

## Implementation Roadmap — Ordered by Document Phases

### Sprint 0: Fix Build Errors (Immediate)
- Add `deliveryCity` and `deliveryState` to `CheckoutDraft` interface in `formSlice.ts`
- Fix the `"bank_transfer" === "paystack"` type comparison in `CheckoutDialog.tsx`

### Sprint 1: Beauty-First Category System (Phase 1-2)
**Why**: Documents say "own skincare first, then cosmetics, then haircare" — the platform needs proper beauty sub-categories
- Add beauty sub-categories to the product category system: Skincare, Colour Cosmetics, Haircare, Fragrances, Personal Care, Organic/Natural Beauty
- Add a "beauty" tag/vertical to shops so the explore page can filter by beauty vendors specifically
- Update the explore page filters to support beauty sub-niche browsing

### Sprint 2: SafeBeauty Badge Tiers (Phase 3, 6)
**Why**: Documents define 5 specific SafeBeauty tiers that vendors earn progressively
- Already have badges in UI — verify the tiers match: Listed → Checked → Trusted → Verified → Approved
- Add NAFDAC number field to product listings (optional, earns higher badge tier)
- Add badge tier progression logic: auto-calculate based on orders, reviews, days active, NAFDAC numbers

### Sprint 3: Vendor Invite & Onboarding Polish (Phase 2)
**Why**: "White-glove onboarding for first 10 vendors" — the DFY flow already exists but needs polish
- Add vendor invite link generator (shareable referral URL with pre-filled shop creation)
- Add "Vendor Invite Script" template in the marketing tools section (from Appendix A)
- Ensure the Done-For-You setup flow is smooth for beauty vendors specifically

### Sprint 4: Buyer-Vendor Matching System (Phase 4)
**Why**: "Create 'Find a Vendor' service" — buyers post what they need, matched to vendors
- Add a "Buyer Request" feature: buyers post what they're looking for
- Admin/system matches requests to verified vendors
- Public display of matches ("We matched this buyer to 3 vendors in 5 minutes")

### Sprint 5: Vendor Rankings & Leaderboards (Phase 6)
**Why**: "Weekly top vendor list" and "Vendor of the Week" are key retention mechanics
- Add weekly auto-calculated vendor rankings by category (orders + reviews + rating)
- Add "Vendor of the Week" spotlight feature on homepage/explore
- Add vendor leaderboard page showing top vendors per category

### Sprint 6: Diaspora Landing Page (Phase 12)
**Why**: "Create 'SteerSolo Diaspora' landing" targeting UK/US/Canada Nigerians
- Add `/diaspora` landing page: "Buy from trusted Nigerian vendors. Pay in GBP/USD."
- Multi-currency display option for products
- Diaspora-specific vendor filter in explore

### Sprint 7: Content & Marketing Dashboard (Phase 5, 9)
**Why**: Documents describe a 7-day content calendar and daily posting rhythm
- Add content calendar tool in entrepreneur dashboard
- Add WhatsApp broadcast templates (the 10 status templates from Appendix B)
- Social media post generator using AI (already partially built)

### Sprint 8: KPI Dashboard (Chapter 8)
**Why**: "Track these 8 numbers every week" — admin needs a KPI tracking view
- Add admin KPI dashboard tracking: Active Vendors, Buyer Traffic/Week, Daily List Views, Vendor Sign-Up Rate, Buyer-Vendor Matches, Community Members, Monthly Revenue, Diaspora Vendors
- Weekly auto-generated KPI report

---

## How We'll Work Through This

Each sprint is self-contained and resumable. When credits run low, we stop at the current sprint boundary. When you return, just say "continue from Sprint X" and we pick up exactly where we left off.

**Recommended start**: Sprint 0 (fix build errors) → Sprint 1 (beauty categories) → Sprint 2 (SafeBeauty tiers)

These first sprints align with Phase 1-2 of both documents and set the foundation for everything else.

## Important Note

About 70% of both documents describe **marketing operations** (posting on TikTok, joining Facebook groups, DMing vendors, WhatsApp statuses) — these are actions YOU take outside the platform. The platform's job is to be ready when those vendors and buyers arrive. That's what these sprints build.

