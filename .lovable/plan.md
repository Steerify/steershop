

# Plan: Batches 4-7 + Footer Nav on All Pages + Collapsible Quick Actions

## 1. Admin GBP Submissions Tab (Batch 4)

Add a "Google Business Profiles" tab to `AdminMarketingConsultations.tsx` using Tabs. The new tab queries the `google_business_profiles` table (already has admin RLS policies) and displays submissions with status, business name, phone, address, and an update dialog for admin notes/status changes.

**Files:** `src/pages/admin/AdminMarketingConsultations.tsx`

---

## 2. AI Bulk Product Upload (Batch 5)

**New component:** `src/components/BulkProductUpload.tsx` — A dialog where shop owners upload up to 10 images. Each image is uploaded to storage, then all URLs are sent to a new edge function.

**New edge function:** `supabase/functions/ai-bulk-product-create/index.ts` — Receives an array of image URLs, calls Gemini 2.5 Flash (via Lovable AI gateway) with vision to analyze each image and generate: name, description, category, suggested price. Returns draft product objects.

**Integration:** Add a "Bulk Upload with AI" button on `Products.tsx`. After AI generates drafts, owner reviews editable cards and confirms. Products are batch-inserted via `product.service.ts`.

**Files:** New `src/components/BulkProductUpload.tsx`, new `supabase/functions/ai-bulk-product-create/index.ts`, `src/pages/Products.tsx`

---

## 3. Mobile Responsive Orders Page (Batch 6)

Audit `Orders.tsx` for mobile issues:
- The order header (`CardHeader`) uses `flex items-start justify-between` which can overflow on small screens — switch to `flex-col` on mobile
- Action buttons (`flex flex-wrap gap-2`) are already wrapped but button text can be hidden on mobile with icon-only variants
- Invoice dialog needs `max-h-[80vh] overflow-y-auto` on mobile
- Order items grid needs responsive image sizing

**Files:** `src/pages/Orders.tsx`

---

## 4. SEO for Paid Shops (Batch 7)

The `shop-og-meta` function already has LocalBusiness JSON-LD schema, breadcrumbs, and product schemas. The `generate-sitemap` already includes all active shops and products with image tags.

**Enhancements:**
- In `shop-og-meta`: Add `sameAs` array (WhatsApp link), `priceRange` field, and `openingHours` if available. For paid shops (check `is_subscribed` on owner profile), add richer `ItemList` schema for better Google Shopping visibility.
- In `generate-sitemap`: Already complete — no changes needed.

**Files:** `supabase/functions/shop-og-meta/index.ts`

---

## 5. MobileBottomNav on All Dashboard Pages

Currently `MobileBottomNav` is defined inside `Dashboard.tsx` and only rendered there. Extract it to a shared component and add it to: `Products.tsx`, `Orders.tsx`, `MyStore.tsx`, `Settings.tsx`, `Bookings.tsx`, and `Marketing.tsx`.

**Files:** New `src/components/MobileBottomNav.tsx`, then import into 6+ page files.

---

## 6. Collapsible Quick Actions (Google-style)

The Quick Actions grid on the dashboard currently shows all 11 items. Make it collapsible:
- Show first 6 items by default (2 rows on mobile, 2 rows on desktop)
- Add a "Show more" / "Show less" toggle button below with a chevron icon
- Use `localStorage` to remember the user's preference
- Animate the expand/collapse with CSS transition

**Files:** `src/pages/Dashboard.tsx` (Quick Actions section, lines 840-861)

---

## Summary

| # | Feature | Files | Effort |
|---|---------|-------|--------|
| 4 | Admin GBP tab | `AdminMarketingConsultations.tsx` | Medium |
| 5 | AI bulk product upload | New component + edge function + `Products.tsx` | Large |
| 6 | Mobile responsive Orders | `Orders.tsx` | Medium |
| 7 | SEO enhancements | `shop-og-meta/index.ts` | Small |
| + | Shared MobileBottomNav | New component + 6 pages | Medium |
| + | Collapsible quick actions | `Dashboard.tsx` | Small |

