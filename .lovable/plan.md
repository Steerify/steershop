# Plan: Tutorial Collections, Product Video Upload, Business Plan Visibility, and Plan Features Update

## 1. Convert Tutorial Section to Video Collection System

**Current state:** The courses/tutorials system is text-based with optional video URLs. The admin creates courses with HTML content and optional YouTube/MP4 links. There's no concept of "collections" or social media link drops.

**What changes:**

### Database

- Create a new `tutorial_collections` table (e.g., "Essentials", "Growth Tips", "Marketing") with fields: `id`, `name`, `description`, `cover_image_url`, `is_active`, `sort_order`, `created_at`
- Add a `collection_id` column to the existing `courses` table referencing `tutorial_collections`
- Add a `social_links` JSONB column to `courses` for social media follow/subscribe links (YouTube, Instagram, TikTok, Twitter)
- The existing `video_url` column already supports YouTube and direct video URLs, which is sufficient

### Admin (`src/pages/admin/AdminCourses.tsx`)

- Rename to "Tutorial Manager" with a two-level UI:
  - **Collections tab:** Create/edit/delete collections (name, description, cover image)
  - **Videos tab:** Create tutorial entries with: title, description, video URL (YouTube/TikTok/Instagram embed), collection assignment, social media links (like, follow, subscribe CTAs)
- Remove the HTML content textarea in favor of video-first entries with a short description
- Add social link fields: YouTube channel URL, Instagram profile URL, TikTok profile URL

### Entrepreneur view (`src/pages/entrepreneur/EntrepreneurCourses.tsx`)

- Restructure from flat list to collection-based grid: show collection cards, clicking opens the collection to show videos
- Each video card shows: thumbnail, title, embedded video player, and social CTA buttons ("Subscribe on YouTube", "Follow on Instagram", etc.)
- Keep the enrollment/completion/reward points system

### Customer view (`src/pages/customer/CustomerCourses.tsx`)

- Same collection-based restructure as entrepreneur view

## 2. Product Upload: Video Option (Already Working -- Verify)

**Current state:** The Products page (`src/pages/Products.tsx`) already has a `<VideoUpload>` component at line 713 and passes `videoUrl` to the product service. The `product.service.ts` handles `video_url` in create/update. The `VideoUpload` component uploads to a `product-videos` storage bucket.

**What needs checking/fixing:**

- The product card display (lines 467-543) only shows `product.images[0].url` -- it does NOT show video previews on the product cards. Add a video indicator badge when a product has a `video_url`.
- On the storefront (`ShopStorefront.tsx`), product cards should show a play icon overlay when a video exists, and clicking should open the video
- The `getProducts` service already maps `video_url` correctly

### Changes:

- `**src/pages/Products.tsx`:** Add video indicator on product cards (small play icon overlay when `product.video_url` exists)
- `**src/pages/ShopStorefront.tsx`:** Show video play button on storefront product cards when video exists; add video modal/inline player on product detail view

## 3. Business Plan Visibility for Search Engines and AI

**Current state:** The `ShopStorefront.tsx` already injects JSON-LD structured data for each shop. Business plan shops already get custom branding in the Navbar. SEO meta tags (og:title, description, canonical, etc.) are already set.

**What needs enhancing:**

- For Business plan shops, make the JSON-LD richer: add `sameAs` for social profiles if available, mark as `@type: Store` (more specific than LocalBusiness), add product catalog as `hasOfferCatalog`
- Add `ItemList` schema for products to improve search snippet appearance
- Ensure the storefront header for Business plan shows their logo/name prominently but clicking the brand leads back to SteerSolo homepage (currently it links to SteerSolo via Navbar -- verify this works)

### Changes:

- `**src/pages/ShopStorefront.tsx`:** Enhance JSON-LD for Business plan shops with richer schema. Add a "Powered by SteerSolo" clickable footer link for Business plan shops
- `**src/components/Navbar.tsx`:** Verify the shop branding logo links back to SteerSolo homepage (currently uses `<Link to="/">` which is correct)

## 4. Update Subscription Plan Features Lists

**Current state (from database):**


| Plan     | Current Features                                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Basic    | Up to 20 products, Basic analytics, WhatsApp support, Bank transfer payments                                                                                                                                 |
| Pro      | Up to 100 products, Done-for-you Business Profile, Advanced analytics, AI Shop Assistant, Paystack direct payments, Priority support                                                                         |
| Business | Unlimited products, Full analytics suite, All AI features, Google My Business Setup, SEO Optimization, Organic Marketing Strategy, Priority support, Custom domain (coming soon), Add-on: YouTube/Google Ads |


**What needs updating:** The features lists should be more comprehensive and accurate to reflect what each plan actually provides. Based on what's built:

**Basic:** Up to 20 products/services, Basic analytics dashboard, WhatsApp order link, Bank transfer payments, Product & service listings, Booking system, Store link sharing

**Pro:** Up to 100 products/services, AI-powered descriptions & pricing, Done-for-you Business Profile, Advanced analytics & revenue tracking, Paystack direct payments, AI Shop Assistant (10/month), Marketing poster tools, Priority support

**Business:** Unlimited products/services, Everything in Pro, White-label branding (your logo in navbar), Premium search visibility & badge, Unlimited AI features, Google My Business setup, SEO optimization, Organic marketing strategy, Rich search engine schemas, Custom domain (coming soon)

This requires a database UPDATE to the `subscription_plans.features` column.

---

## Technical Summary


| Priority | Area     | Files                                            | Change                                                                                   |
| -------- | -------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| High     | Database | Migration                                        | Create `tutorial_collections` table, add `collection_id` and `social_links` to `courses` |
| High     | Admin    | `AdminCourses.tsx`                               | Rebuild as collection-based tutorial manager with video + social links                   |
| High     | Frontend | `EntrepreneurCourses.tsx`, `CustomerCourses.tsx` | Collection-based video tutorial UI with social CTAs                                      |
| Medium   | Products | `Products.tsx`, `ShopStorefront.tsx`             | Video indicator badges on product cards, video player in storefront                      |
| Medium   | SEO      | `ShopStorefront.tsx`                             | Enhanced JSON-LD for Business plan shops                                                 |
| Medium   | Plans    | Database UPDATE                                  | Update features arrays for all 3 plans                                                   |
