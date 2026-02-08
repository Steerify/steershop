

# SteerSolo: From Tool to Commerce Infrastructure -- Phase 1 Implementation

## Vision
Transform SteerSolo from "online store builder" to "the operating system for small businesses in Nigeria" by adding the missing infrastructure layers that increase stickiness, revenue per user, and investor appeal.

## What Already Exists (No Work Needed)
- Store creation and management
- Payments (Paystack integration with webhook verification)
- Orders and order tracking
- WhatsApp order flow
- Logistics (Terminal Africa + Sendbox + manual fallback)
- AI features (Stroke My Shop, Know This Shop, Marketing AI Assistant)
- Subscription billing (Basic/Pro/Business tiers)
- Analytics dashboard with revenue charts
- Courses and rewards system
- KYC verification
- Referral system
- Payout management
- Product reviews and ratings
- Featured shops and top seller banners
- SEO structured data

## What's Missing (This Plan)
This plan covers **Phase 1** -- the highest-impact features that move SteerSolo toward platform status. Each feature is scoped to be implementable.

---

## Phase 1: Core Commerce Infrastructure Gaps

### 1. AI Product Description Generator
**What:** When sellers add/edit products, an "AI Generate" button auto-writes a compelling product description based on the product name, category, and price.

**Why:** Removes the biggest friction point for sellers -- writing copy. Makes listings more professional, which increases buyer trust and conversion.

**Implementation:**
- Add a "Generate with AI" button to the product creation form in `src/pages/Products.tsx`
- Create a new edge function `supabase/functions/ai-product-description/index.ts` that uses Lovable AI (gemini-2.5-flash) to generate descriptions
- Track usage in `marketing_ai_usage` table (already exists) with `feature_type: 'product_description'`
- Respect subscription limits (Basic: blocked, Pro: 10/month, Business: unlimited)

### 2. AI Price Suggestions
**What:** Alongside the AI description, suggest a competitive price range based on the product name and category.

**Why:** New sellers struggle with pricing. This reduces decision paralysis and speeds up store setup.

**Implementation:**
- Add to the same `ai-product-description` edge function -- return both description and price suggestion
- Display as a subtle hint below the price field: "Suggested range: N2,000 - N5,000"
- Non-intrusive, purely advisory

### 3. Invoice Generation
**What:** Auto-generate downloadable PDF-style invoices for completed orders.

**Why:** Adds business legitimacy. Nigerian SMEs need invoices for record-keeping and B2B sales. This is a "stickiness" feature -- once sellers depend on it, they won't leave.

**Implementation:**
- Create `src/components/InvoiceTemplate.tsx` -- a styled HTML invoice component
- Add "Download Invoice" button to the order detail view in `src/pages/Orders.tsx`
- Use browser's `window.print()` with a print-optimized CSS layout (no backend needed)
- Include: shop name/logo, order items, quantities, prices, totals, payment status, date, unique invoice number

### 4. Promoted Listings / Boost Store Visibility
**What:** Allow sellers to pay to have their shop or products appear first in the `/shops` discovery page and homepage featured section.

**Why:** This is a critical revenue layer beyond subscriptions. Transaction-based income that scales with the platform.

**Implementation:**
- Create `promoted_listings` database table (shop_id, amount_paid, starts_at, expires_at, is_active, listing_type)
- Add "Boost My Store" button on the seller dashboard
- Create edge function `supabase/functions/paystack-promote/index.ts` for payment
- Modify `src/pages/Shops.tsx` to show promoted shops first (with a subtle "Promoted" badge)
- Admin view to manage promotions in `src/pages/admin/AdminPromotedListings.tsx`

### 5. Customer Records / CRM Lite
**What:** A simple customer list on the seller dashboard showing everyone who has ordered, with order history and total spend per customer.

**Why:** Transforms SteerSolo from one-off transactions to relationship management. Sellers see repeat buyers, high-value customers, and can reach out via WhatsApp.

**Implementation:**
- Create `src/pages/Customers.tsx` -- a new page showing aggregated customer data from the `orders` table
- Group by `customer_email` or `customer_phone` to build customer profiles
- Show: name, phone, email, total orders, total spent, last order date, WhatsApp link
- Add route `/customers` to `App.tsx` (entrepreneur-protected)
- Add "Customers" quick action to the Dashboard

### 6. Homepage Repositioning
**What:** Update the hero section and homepage messaging to reflect the new positioning: "The operating system for small businesses in Africa."

**Why:** The current messaging says "Sell online." The new messaging must communicate the full commerce stack to attract both users and investors.

**Implementation:**
- Update hero tagline in `src/pages/Index.tsx` from "Sell online" to "Run your business. All in one place."
- Update the typewriter texts to reflect the full stack: "Sell products", "Track orders", "Get paid securely", "Grow with AI", "Manage customers"
- Update the value proposition cards to include invoicing, customer management, and AI tools
- Update the `WhySteerSolo` component callout from "Use social media for marketing. Use SteerSolo for selling." to "Use social media for marketing. Use SteerSolo for everything else."

---

## Technical Details

### New Database Table: `promoted_listings`
```text
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
shop_id         uuid        NOT NULL REFERENCES shops(id)
product_id      uuid        NULL (for future product-level boosts)
listing_type    text        NOT NULL DEFAULT 'shop' (shop | product)
amount_paid     numeric     NOT NULL
payment_ref     text        NULL
starts_at       timestamptz NOT NULL DEFAULT now()
expires_at      timestamptz NOT NULL
is_active       boolean     DEFAULT true
created_at      timestamptz DEFAULT now()
```

RLS: Shop owners can insert/view their own. Admins can manage all. Public can view active ones (for display).

### New Edge Function: `ai-product-description`
- Accepts: product_name, category, price (optional)
- Returns: { description: string, price_suggestion: { min: number, max: number } }
- Uses Lovable AI (gemini-2.5-flash for speed and cost)
- Enforces subscription limits via `marketing_ai_usage` table

### New Route: `/customers`
- Protected for ENTREPRENEUR role
- Added to Dashboard quick actions and mobile menu

### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/ai-product-description/index.ts` | AI description + price suggestion |
| `src/pages/Customers.tsx` | Customer records/CRM page |
| `src/components/InvoiceTemplate.tsx` | Printable invoice component |

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/Products.tsx` | Add AI generate button to product form |
| `src/pages/Orders.tsx` | Add "Download Invoice" button |
| `src/pages/Shops.tsx` | Sort promoted shops first |
| `src/pages/Dashboard.tsx` | Add Customers quick action |
| `src/pages/Index.tsx` | Repositioned hero messaging |
| `src/components/WhySteerSolo.tsx` | Updated callout copy |
| `src/App.tsx` | Add `/customers` route |

### Migration
- Create `promoted_listings` table with RLS policies

---

## What This Achieves

After Phase 1, SteerSolo becomes:
- **Store creation** (already exists)
- **Payments** (already exists)
- **Orders + Invoicing** (NEW)
- **Customer records** (NEW)
- **AI-powered listings** (NEW)
- **Paid visibility/ads** (NEW -- new revenue stream)
- **Analytics** (already exists)
- **Logistics** (already exists)

This moves the platform from 4/8 commerce stack pillars to 7/8 -- a meaningful leap toward "commerce operating system."

---

## Future Phases (Not in This Plan)
- Phase 2: Marketplace discovery features, category browsing, seller verification badges on search
- Phase 3: Multi-country expansion, currency support
- Phase 4: Offline agent onboarding portal, telco partnerships

