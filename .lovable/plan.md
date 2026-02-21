
# Make Shops Discoverable by AI Crawlers and Search Engines

## Problem

Currently, shop pages are only served as rich HTML to a limited set of bot user agents (Googlebot, Twitterbot, etc.) via `vercel.json`. Modern AI crawlers like **GPTBot** (ChatGPT), **PerplexityBot**, **ClaudeBot**, **Google-Extended** (Gemini), and others are NOT included -- meaning your shops are invisible to AI-powered search and answer engines.

Additionally, the client-side rendered shop and product pages lack proper meta tags for non-JS crawlers, and the shop-og-meta edge function could serve richer, more structured content.

---

## Changes

### 1. Add AI Crawler User Agents to `vercel.json`

Expand the bot detection regex to include all major AI crawlers:

Current bots: `Googlebot|bingbot|facebookexternalhit|Twitterbot|WhatsApp|Slackbot|LinkedInBot|Discordbot|TelegramBot`

Add: `GPTBot|ChatGPT-User|PerplexityBot|ClaudeBot|Claude-Web|Anthropic|Google-Extended|Applebot|Bytespider|CCBot|cohere-ai|Diffbot|YouBot|PetalBot|Amazonbot|meta-externalagent|OAI-SearchBot|AI2Bot|Scrapy|DuckDuckBot|YandexBot|SemrushBot|AhrefsBot|MJ12bot|DotBot`

Also add a **product-level rewrite** so individual product pages are also served with rich meta:

```json
{
  "source": "/shop/:slug/product/:productId",
  "has": [{ "type": "header", "key": "user-agent", "value": "...(all bots)..." }],
  "destination": "https://hwkcqgmtinbgyjjgcgmp.supabase.co/functions/v1/shop-og-meta?slug=:slug&product=:productId"
}
```

### 2. Enhance `supabase/functions/shop-og-meta/index.ts`

- Accept optional `product` query parameter for product-level pages
- When a product ID is provided, serve a **dedicated product page** with:
  - Product-specific og:title, og:description, og:image
  - Individual `Product` JSON-LD schema with price, availability, brand
  - Richer HTML body with product details for text-based crawlers
- For shop pages, enhance the HTML body with:
  - Product listings with names, prices, descriptions, and image tags
  - Shop location, category, and contact info as visible text
  - Internal links between products for crawl depth
  - `<nav>` breadcrumb for semantic structure

### 3. Enhance Client-Side Meta Tags in `src/pages/ShopStorefront.tsx`

Update the existing `useEffect` to also set:
- `og:title`, `og:description`, `og:image`, `og:url` meta tags
- `canonical` link
- `description` meta tag
- Enhanced JSON-LD with products, offers, address with state/region
- `meta name="robots" content="index, follow"`

### 4. Add Client-Side Meta Tags to `src/pages/ProductDetails.tsx`

Add a `useEffect` similar to `ShopStorefront.tsx` that sets:
- Product-specific page title: "Product Name | Shop Name | SteerSolo"
- `og:title`, `og:description`, `og:image` for the specific product
- `Product` JSON-LD schema with price, availability, reviews, brand
- `canonical` link to the product URL

### 5. Add Shops Directory to `supabase/functions/generate-sitemap/index.ts`

- Already includes shop URLs -- no changes needed here

---

## Technical Summary

| File | Change |
|------|--------|
| `vercel.json` | Add 25+ AI crawler user agents; add product-level bot rewrite rule |
| `supabase/functions/shop-og-meta/index.ts` | Support product-level pages; richer HTML body with product listings, breadcrumbs, nav links |
| `src/pages/ShopStorefront.tsx` | Enhanced meta tags (og, canonical, description, robots); richer JSON-LD with products and address |
| `src/pages/ProductDetails.tsx` | Add meta tags and Product JSON-LD schema for individual product discoverability |

This ensures every shop and product on SteerSolo is discoverable by Google, Bing, ChatGPT, Perplexity, Claude, Gemini, and all other AI/search crawlers -- just like Instagram profiles and posts.
