

# Homepage + FAQ + Shop SEO + Social Proof Enhancements

## Overview
Five changes across 3 files, with 1 new component file.

---

## 1. Replace City Names Section with "What is SteerSolo?" + "Why Not Social Media?"

**File: `src/pages/Index.tsx`**

Replace the city names section (lines 170-180) with two new sections:

**Section A: "What is SteerSolo?"** -- A concise explainer with 3 cards (Your Own Store, WhatsApp-Powered, Secure Payments) that immediately tells visitors what the platform does.

**Section B: "Why not just sell on social media?"** -- A comparison table showing features side by side (Social Media vs SteerSolo). Features compared:
- Professional product catalog (Social: No, SteerSolo: Yes)
- Automatic order tracking (Social: No, SteerSolo: Yes)
- Secure online payments (Social: No, SteerSolo: Yes)
- One shareable store link (Social: No, SteerSolo: Yes)
- Customer order history (Social: No, SteerSolo: Yes)
- Sales analytics (Social: No, SteerSolo: Yes)
- Free to start posting (Both: Yes)
- Large existing audience (Social: Yes, SteerSolo: Coming soon)

Ends with a callout: "Use social media for marketing. Use SteerSolo for selling."

This will be implemented as a `WhyNotSocialMedia` component defined in the same file.

---

## 2. Add Social Media Comparison FAQs

**File: `src/pages/FAQ.tsx`**

Add a new FAQ category "SteerSolo vs Social Media" (id: `social-comparison`, icon: `Target`) with these questions:

- "Why should I use SteerSolo instead of selling on Instagram/WhatsApp?"
- "Can I still use social media with SteerSolo?"
- "How is SteerSolo different from a regular website builder?"
- "What if I already have customers on WhatsApp?"

---

## 3. Add Structured Data to Shop Storefront Pages

**File: `src/pages/ShopStorefront.tsx`**

Add a `useEffect` that injects JSON-LD structured data when a shop loads. The schema will be `LocalBusiness` type including:
- Shop name, description, URL
- Logo image
- Aggregate rating (from shop's `average_rating` and `total_reviews`)
- Product catalog count

The script element will be cleaned up on unmount. This makes individual shop pages discoverable by Google and AI search engines.

---

## 4. Enhance Social Proof with Dynamic Numbers

**File: `src/components/SocialProofStats.tsx`**

The stats are already dynamic (fetching from database). Enhancements:
- Add a 5th stat: "Orders Completed" using a count of orders with `status = 'completed'`
- Add animated count-up effect on the numbers
- Add a subtle "Live data" indicator badge

---

## Technical Details

### New imports needed in Index.tsx
- `Target` from lucide-react (already partially imported)
- The `WhyNotSocialMedia` component will be defined inline in the same file

### JSON-LD Schema for ShopStorefront (injected via useEffect)
```text
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": shop.shop_name,
  "description": shop.description,
  "url": "https://steersolo.lovable.app/shop/{slug}",
  "image": shop.logo_url,
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": shop.average_rating,
    "reviewCount": shop.total_reviews
  }
}
```

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Replace city section with "What is SteerSolo" + comparison table |
| `src/pages/FAQ.tsx` | Add "SteerSolo vs Social Media" category |
| `src/pages/ShopStorefront.tsx` | Add JSON-LD structured data |
| `src/components/SocialProofStats.tsx` | Add orders completed stat + live indicator |

