

# Plan: Turn SteerSolo into a Brand

## Current State
SteerSolo already has strong foundations — African-inspired color palette (Adire Indigo, Nigerian Green, Gold), Adire textile patterns, Poppins typography, themed 404 page, celebration-aware navbar, and localized Nigerian English copy. But the brand is scattered — there's no central brand system, inconsistent micro-interactions, no founder story depth, and the experience lacks the polish of a brand people *feel*.

## What We'll Build

### 1. Brand Guidelines Page (`/brand`)
A public-facing brand guide that makes SteerSolo look like a real company — useful for partnerships, press, and internal consistency.

**Contents:**
- Brand story summary + mission/vision one-liners
- Logo usage (light/dark variants with download-ready display)
- Color palette (Adire Indigo, Nigerian Green, Gold, neutrals) — each with hex/HSL values, copyable
- Typography scale (Poppins weights + usage hierarchy)
- Tone of voice rules ("Nigerian English, warm, direct, no corporate jargon")
- Adire pattern showcase (all 6 variants displayed)
- Do's and Don'ts visual examples

**Route:** `/brand` — public, no auth required

### 2. Brand Experience Polish

**a) Branded Loading Screen** — Replace generic "Loading..." in `PageLoadingSkeleton` with an animated SteerSolo logo + tagline "Your Daily Selling System" with a smooth fade sequence.

**b) Branded Toast/Notification Style** — Add a custom Sonner theme using brand colors so every success/error toast feels on-brand.

**c) Consistent Micro-copy** — Update key touchpoints with brand voice:
- Auth page: Welcome back messaging with Nigerian warmth
- Onboarding completion: Celebration moment ("Welcome to the movement!")
- Empty states across dashboard pages

**d) Branded Scroll-to-Top Button** — A floating button with the SteerSolo accent color that appears on long pages.

### 3. Brand Storytelling & Content

**a) Enhanced About Page** — Add:
- Founder photo/avatar placeholder section
- Timeline of SteerSolo milestones (pull from GrowthPage data)
- "Our Values" section with 4 core values (Hustle with Structure, Trust First, African Pride, Community Over Competition)
- Team/community section

**b) Blog/Updates Page (`/updates`)** — A simple content page pulling from the existing `platform_updates` table, styled as a brand blog. Each update becomes a branded story card.

**c) Social Proof Consistency** — Standardize how testimonials appear across homepage, SEO pages, and pricing with a unified `TestimonialCard` component.

---

## Files to Create
1. **`src/pages/BrandPage.tsx`** — Full brand guidelines page
2. **`src/pages/UpdatesPage.tsx`** — Blog/updates page from platform_updates table
3. **`src/components/TestimonialCard.tsx`** — Reusable branded testimonial component
4. **`src/components/ScrollToTop.tsx`** — Branded floating scroll button

## Files to Edit
1. **`src/App.tsx`** — Add `/brand` and `/updates` routes
2. **`src/components/PageLoadingSkeleton.tsx`** — Branded loading with tagline animation
3. **`src/pages/AboutPage.tsx`** — Add values section, milestone timeline, founder section
4. **`src/components/Footer.tsx`** — Add "Brand" link to Quick Links
5. **`src/index.css`** — Add branded toast theme overrides and scroll-to-top styles
6. **`src/components/Navbar.tsx`** — Add "Brand" to navigation if appropriate (or keep in footer only)

## Technical Notes
- No database changes required — brand page is purely frontend, updates page uses existing `platform_updates` table
- Color values are already defined in CSS variables — brand page will reference them directly
- All new pages are public (no auth), lazy-loaded for performance
- The `TestimonialCard` component will be adopted by homepage, pricing, and SEO pages in subsequent iterations

