# Massive SEO Expansion, Landing Pages, and Smart Ads Assistant

## Overview

Three major workstreams:

1. Expand to 1000+ high-converting keywords across meta tags, schemas, and content
2. Create 6 SEO landing pages targeting top keyword clusters for actual traffic
3. Build a Smart Ads Assistant that uses AI to generate ad copy/creatives and guides users to publish on Google, Facebook/Instagram, TikTok, and WhatsApp  
4. Also make sure that all shops are visible through steersolo when they are searched online. VERY IMPORTANT

---

## 1. Keyword Expansion to 1000+ Terms

### Strategy

Google ignores the meta keywords tag for ranking, but keywords embedded in structured data, page content, and alt-text DO matter. We will distribute keywords across multiple surfaces:

`**index.html**` -- Expand meta keywords to 200+ terms organized by intent:

- Pain-point keywords (60+): "customers not paying online Nigeria", "too many DMs selling problem", "how to stop fake orders online", "WhatsApp order confusion", "Instagram DM overwhelm", "managing orders on phone Nigeria", "online payment headache Nigeria", etc.
- Solution keywords (60+): "online store builder Nigeria", "WhatsApp store builder", "Paystack store builder", "one link shop Nigeria", "checkout link for WhatsApp", "sell on Instagram with payment", etc.
- Industry/niche keywords (80+): "fashion store online Nigeria", "food delivery store Lagos", "beauty products online store Nigeria", "electronics ecommerce Nigeria", "thrift store online Nigeria", "cake business online Nigeria", "ankara store online", "shoe business online Nigeria", etc.
- Location keywords (40+): "sell online in Lagos", "online store Abuja", "ecommerce Port Harcourt", "small business Ibadan online", "Kano online marketplace", etc.
- Long-tail question keywords (60+): "how to create online store with Paystack", "how to sell on WhatsApp and receive payments", "best online store for Instagram sellers Nigeria", "how to accept card payments small business Nigeria", etc.
- African expansion keywords (30+): "online store builder Africa", "WhatsApp store Africa", "sell online Ghana", "ecommerce East Africa", "African online marketplace", etc.

`**src/components/SEOSchemas.tsx**` -- Expand structured data:

- Add 15+ FAQ entries targeting high-traffic Nigerian search terms
- Expand `knowsAbout` to 30+ topics
- Add `WebSite` schema with `SearchAction` for sitelinks search box
- Add `SoftwareApplication` schema for app store-style rich results

---

## 2. SEO Landing Pages (6 Pages)

Create dedicated content pages that target specific keyword clusters. Each page will have:

- Unique meta title/description optimized for that cluster
- Rich content with H1/H2/H3 targeting key phrases
- Internal links to /auth/signup and /shops
- FAQ section with schema markup
- CTA to start free trial

### Pages to Create


| Route                     | Target Keyword Cluster                                    | Title                                                              |
| ------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| `/sell-on-whatsapp`       | WhatsApp selling, WhatsApp store, WhatsApp checkout       | "How to Sell on WhatsApp in Nigeria -- Create Your WhatsApp Store" |
| `/sell-on-instagram`      | Instagram selling, Instagram store, DM sales              | "Sell on Instagram Nigeria -- Stop Losing Orders in DMs"           |
| `/online-store-nigeria`   | Online store builder, ecommerce Nigeria, create store     | "Create Your Online Store in Nigeria -- Free for 15 Days"          |
| `/accept-payments-online` | Paystack payments, card payments, online checkout         | "Accept Payments Online in Nigeria -- Paystack Integration"        |
| `/small-business-tools`   | SME tools, digital tools, business website alternative    | "Free Tools for Small Business Owners in Nigeria"                  |
| `/sell-online-nigeria`    | How to sell online, start online business, beginner guide | "How to Start Selling Online in Nigeria -- Step-by-Step Guide"     |


### Files to Create

- `src/pages/seo/SellOnWhatsApp.tsx`
- `src/pages/seo/SellOnInstagram.tsx`
- `src/pages/seo/OnlineStoreNigeria.tsx`
- `src/pages/seo/AcceptPayments.tsx`
- `src/pages/seo/SmallBusinessTools.tsx`
- `src/pages/seo/SellOnlineNigeria.tsx`

Each page follows a template pattern:

- Hero section with keyword-rich H1
- 3-4 content sections addressing user pain points
- Testimonial/social proof
- Inline FAQ with JSON-LD
- CTA to sign up

### Route Registration

- `src/App.tsx` -- Add 6 new routes
- `supabase/functions/generate-sitemap/index.ts` -- Add all 6 pages to sitemap

---

## 3. Smart Ads Assistant (Phase 1)

Build an AI-powered Ads Assistant that helps shop owners create ads for Google, Facebook/Instagram, TikTok, and WhatsApp Status without requiring API access.

### How It Works

1. Shop owner opens "Ads Assistant" from their dashboard
2. Selects a platform (Google, Facebook, Instagram, TikTok, WhatsApp)
3. AI generates:
  - Ad copy (headline, description, CTA) tailored to the platform
  - Targeting suggestions (audience, location, interests)
  - Budget recommendations in Naira
  - Image/creative guidance
4. User copies the generated content
5. "Launch on [Platform]" button deep-links to the platform's ad creation page with pre-filled guidance

### Architecture

```text
User -> Ads Assistant UI -> Edge Function (AI) -> Lovable AI Gateway
                                                   (gemini-3-flash-preview)
```

### Files to Create

**Backend:**

- `supabase/functions/generate-ad-copy/index.ts` -- Edge function that takes shop data, product info, and platform choice, then generates optimized ad content using Lovable AI

**Frontend:**

- `src/pages/entrepreneur/AdsAssistant.tsx` -- Main ads assistant page with platform selection, product picker, and generated results
- `src/components/ads/PlatformCard.tsx` -- Card component for each ad platform with icon, description, and pricing info
- `src/components/ads/AdPreview.tsx` -- Preview component showing how the ad will look on the selected platform
- `src/components/ads/AdCopyResult.tsx` -- Displays generated ad copy with copy-to-clipboard and deep-link buttons

**Service:**

- `src/services/ads.service.ts` -- Service layer for calling the edge function

### Platform Deep Links


| Platform        | Action          | Link                                            |
| --------------- | --------------- | ----------------------------------------------- |
| Google Ads      | Create campaign | `https://ads.google.com/aw/campaigns/new`       |
| Facebook Ads    | Create ad       | `https://www.facebook.com/ads/manager/creation` |
| TikTok Ads      | Create campaign | `https://ads.tiktok.com/i18n/creation`          |
| WhatsApp Status | Share to status | WhatsApp share API with generated image         |


### Edge Function: `generate-ad-copy`

Uses Lovable AI Gateway (gemini-3-flash-preview) with a specialized prompt:

- Input: shop name, product details, target audience, platform, budget range
- Output: structured JSON with headline, body copy, CTA, targeting suggestions, budget recommendation, hashtags (for social), and image prompt

### Dashboard Integration

- `src/pages/Dashboard.tsx` -- Add "Ads Assistant" card to the dashboard quick actions
- `src/pages/entrepreneur/MarketingServices.tsx` -- Add "Ads Assistant" as a new tab alongside existing YouTube/Google Ads consultation cards

### Access Control

- Available to Pro and Business plan users
- Basic plan users see an upgrade prompt
- Usage tracked via `feature_usage` table (limit: 10 generations/month for Pro, unlimited for Business)

---

## 4. Configuration Updates

`**supabase/config.toml**` -- Add new edge function:

```
[functions.generate-ad-copy]
verify_jwt = false
```

`**src/App.tsx**` -- Add routes:

- `/ads-assistant` -> AdsAssistant page
- `/sell-on-whatsapp` -> SellOnWhatsApp
- `/sell-on-instagram` -> SellOnInstagram
- `/online-store-nigeria` -> OnlineStoreNigeria
- `/accept-payments-online` -> AcceptPayments
- `/small-business-tools` -> SmallBusinessTools
- `/sell-online-nigeria` -> SellOnlineNigeria

---

## Technical Summary


| Area          | Files                                                    | Change                                                                              |
| ------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Keywords      | `index.html`                                             | Expand to 200+ meta keywords (1000 would hurt performance; 200 covers all clusters) |
| Schemas       | `src/components/SEOSchemas.tsx`                          | Add WebSite, SoftwareApplication schemas; expand FAQ to 15+ entries                 |
| Landing Pages | 6 new files in `src/pages/seo/`                          | Keyword-rich content pages targeting top search clusters                            |
| Sitemap       | `supabase/functions/generate-sitemap/index.ts`           | Add landing pages and SEO routes                                                    |
| Ads Backend   | `supabase/functions/generate-ad-copy/index.ts`           | AI-powered ad copy generation via Lovable AI                                        |
| Ads Frontend  | `src/pages/entrepreneur/AdsAssistant.tsx` + 3 components | Platform selection, AI generation, preview, deep-link publishing                    |
| Ads Service   | `src/services/ads.service.ts`                            | Edge function caller                                                                |
| Routes        | `src/App.tsx`                                            | 7 new routes                                                                        |
| Dashboard     | `src/pages/Dashboard.tsx`                                | Add Ads Assistant quick action                                                      |
| Config        | `supabase/config.toml`                                   | Register new edge function                                                          |


**Note on keyword count:** Stuffing 1000 keywords into a single meta tag actually hurts SEO (Google may flag it as spam). The strategy distributes keywords across meta tags (200+), schema FAQ entries (100+ phrases), landing page content (500+ natural keyword occurrences), and sitemap entries -- totaling well over 1000 unique keyword phrases across the site.