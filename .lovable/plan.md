
# SteerSolo Comprehensive Enhancement Plan
## Logistics Integration + Bug Fixes + UX Improvements

---

## Overview

This plan addresses **5 major areas**:
1. **Nigeria Logistics Integration** - Research, API integration, database schema, and fallback workflows
2. **Shops Page Bug Fix** - Debug and fix why valid shops aren't showing
3. **Email Verification Notification** - Add post-signup notification for email-based signups
4. **Unique Store Slug Enforcement** - Validate and prevent duplicate slugs
5. **Minor Fixes** - Various UX improvements

---

## Part 1: Nigeria Logistics Integration

### 1.1 Recommended Logistics Providers

| Provider | API Available | Coverage | Pricing | Best For |
|----------|--------------|----------|---------|----------|
| **Terminal Africa** | Yes (RESTful) | Multi-carrier aggregator (GIG, DHL, UPS, FedEx) | Pay-per-use | Primary choice - single API for multiple carriers |
| **Sendbox** | Yes (RESTful) | Lagos, nationwide | Competitive | Urban deliveries, e-commerce |
| **GIG Logistics** | Yes (API) | Nationwide | Variable | Established carrier, same-day options |
| **Kobo360** | Limited API | B2B focused | Enterprise | Large cargo, not ideal for e-commerce |
| **SendStack** | Yes (RESTful) | Lagos, urban areas | Low cost | Budget option, smaller parcels |

**Recommendation**: Use **Terminal Africa** as primary (aggregates 10+ carriers) with **Sendbox** as fallback.

### 1.2 API Integration Examples

**Terminal Africa (Primary):**
```javascript
// Edge Function: supabase/functions/logistics-get-rates/index.ts
const TERMINAL_API_KEY = Deno.env.get('TERMINAL_API_KEY');
const BASE_URL = 'https://api.terminal.africa/v1';

// Get shipping rates
const getRates = async (parcel_id: string, pickup_address_id: string, delivery_address_id: string) => {
  const response = await fetch(`${BASE_URL}/rates/shipment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TERMINAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parcel_id,
      pickup_address: pickup_address_id,
      delivery_address: delivery_address_id,
      currency: 'NGN'
    })
  });
  return response.json();
};

// Create shipment
const createShipment = async (data: ShipmentData) => {
  const response = await fetch(`${BASE_URL}/shipments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TERMINAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rate_id: data.rate_id,  // Selected rate from getRates
      parcel_id: data.parcel_id,
      pickup_address: data.pickup_address_id,
      delivery_address: data.delivery_address_id,
      metadata: { order_id: data.order_id }
    })
  });
  return response.json();
};

// Track shipment
const trackShipment = async (shipment_id: string) => {
  const response = await fetch(`${BASE_URL}/shipments/${shipment_id}/tracking`, {
    headers: { 'Authorization': `Bearer ${TERMINAL_API_KEY}` }
  });
  return response.json();
};
```

**Sendbox (Secondary):**
```javascript
// Edge Function: supabase/functions/sendbox-integration/index.ts
const SENDBOX_API_KEY = Deno.env.get('SENDBOX_API_KEY');
const BASE_URL = 'https://api.sendbox.co';

// Request shipping quote
const getQuote = async (origin: Address, destination: Address, weight: number) => {
  const response = await fetch(`${BASE_URL}/shipping/quotes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDBOX_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      origin: {
        first_name: origin.name.split(' ')[0],
        last_name: origin.name.split(' ').slice(1).join(' '),
        street: origin.address,
        city: origin.city,
        state: origin.state,
        country: 'NG',
        phone: origin.phone
      },
      destination: {
        first_name: destination.name.split(' ')[0],
        last_name: destination.name.split(' ').slice(1).join(' '),
        street: destination.address,
        city: destination.city,
        state: destination.state,
        country: 'NG',
        phone: destination.phone
      },
      weight: { value: weight, unit: 'kg' }
    })
  });
  return response.json();
};
```

### 1.3 Database Schema

**New Tables:**

```sql
-- Delivery orders table
CREATE TABLE IF NOT EXISTS delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'terminal', 'sendbox', 'manual'
  provider_shipment_id TEXT, -- External shipment ID
  provider_tracking_code TEXT,
  
  -- Addresses
  pickup_address JSONB NOT NULL,
  delivery_address JSONB NOT NULL,
  
  -- Parcel info
  weight_kg NUMERIC(10,2),
  dimensions JSONB, -- {length, width, height}
  
  -- Pricing
  delivery_fee NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending', 
  -- pending, confirmed, picked_up, in_transit, out_for_delivery, delivered, failed, cancelled
  
  -- Timestamps
  estimated_delivery_date TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery tracking events (audit log)
CREATE TABLE IF NOT EXISTS delivery_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_order_id UUID NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL,
  description TEXT,
  location TEXT,
  provider_event_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Saved addresses for shops (pickup locations)
CREATE TABLE IF NOT EXISTS shop_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  
  label TEXT NOT NULL, -- 'Main Warehouse', 'Lagos Office'
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'NG',
  lat NUMERIC(10,8),
  lng NUMERIC(11,8),
  
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(shop_id, label)
);

-- RLS Policies
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_addresses ENABLE ROW LEVEL SECURITY;

-- Shop owners can manage their delivery orders
CREATE POLICY "Shop owners can manage delivery orders"
  ON delivery_orders FOR ALL
  USING (EXISTS (
    SELECT 1 FROM shops WHERE shops.id = delivery_orders.shop_id 
    AND shops.owner_id = auth.uid()
  ));

-- Customers can view their order deliveries
CREATE POLICY "Customers can view their deliveries"
  ON delivery_orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = delivery_orders.order_id 
    AND orders.customer_id = auth.uid()
  ));

-- Tracking events viewable by order parties
CREATE POLICY "View tracking events"
  ON delivery_tracking_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM delivery_orders d
    JOIN orders o ON o.id = d.order_id
    JOIN shops s ON s.id = d.shop_id
    WHERE d.id = delivery_tracking_events.delivery_order_id
    AND (o.customer_id = auth.uid() OR s.owner_id = auth.uid())
  ));

-- Shop owners manage their addresses
CREATE POLICY "Shop owners manage addresses"
  ON shop_addresses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM shops WHERE shops.id = shop_addresses.shop_id 
    AND shops.owner_id = auth.uid()
  ));
```

### 1.4 Implementation Plan

| Step | Description | Effort |
|------|-------------|--------|
| 1 | Create database tables & RLS policies | 2h |
| 2 | Create `logistics-get-rates` edge function | 3h |
| 3 | Create `logistics-book-delivery` edge function | 3h |
| 4 | Create `logistics-track-shipment` edge function | 2h |
| 5 | Create `logistics-webhook` for status updates | 2h |
| 6 | Create `delivery.service.ts` frontend service | 2h |
| 7 | Build "Arrange Delivery" UI in order management | 4h |
| 8 | Build delivery tracking component | 3h |
| 9 | Add delivery status to order timeline | 2h |
| 10 | Testing and error handling | 3h |

**Total Estimated Effort: 26 hours**

### 1.5 Edge Function Endpoints

```text
POST /logistics-get-rates
  - Input: { order_id, pickup_address, delivery_address, weight }
  - Output: { rates: [{ carrier, price, estimated_days }] }

POST /logistics-book-delivery
  - Input: { order_id, rate_id, pickup_address_id }
  - Output: { delivery_order_id, tracking_code, estimated_delivery }

GET /logistics-track/:delivery_order_id
  - Output: { status, events: [...], estimated_delivery }

POST /logistics-webhook
  - Receives callbacks from Terminal/Sendbox
  - Updates delivery_orders status
  - Inserts delivery_tracking_events
```

### 1.6 Error Handling Recommendations

```typescript
// Retry logic for transient failures
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status >= 500 && i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
};

// Error categories
const handleLogisticsError = (error: any) => {
  if (error.code === 'RATE_NOT_FOUND') {
    return { userMessage: 'Delivery not available for this route', fallback: true };
  }
  if (error.code === 'PICKUP_UNAVAILABLE') {
    return { userMessage: 'Pickup location not serviceable', fallback: true };
  }
  return { userMessage: 'Unable to arrange delivery. Please try again.', fallback: true };
};
```

### 1.7 Manual Fallback Workflow

For vendors without API access or when APIs fail:

```text
MANUAL DELIVERY BOOKING FLOW:
1. Vendor selects "Manual Delivery" option
2. Form collects:
   - Delivery company name
   - Tracking number (if available)
   - Estimated delivery date
   - Delivery fee charged
3. Vendor manually updates status:
   - Picked up → In Transit → Delivered
4. Customer receives email/WhatsApp notifications
5. System records all updates for order history
```

**Manual UI Components:**
- ManualDeliveryForm.tsx - Booking form
- ManualStatusUpdater.tsx - Status change dropdown
- Delivery timeline shows manual entries distinctly

---

## Part 2: Shops Page Bug Fix

### Issue Analysis
The current `getShops` service logic is correct, but the issue is that:
1. Only 2 shops meet ALL criteria (valid subscription + products > 0)
2. The owner relationship JOIN might fail if profile doesn't exist

### Identified Shops That Should Show:
| Shop | Valid Subscription | Products | Should Show |
|------|-------------------|----------|-------------|
| greenace | Yes (2032) | 1 | Yes |
| steersoloshop | Yes (2026-02-06) | 4 | Yes |
| canada-bar | Yes (2026-02-14) | 0 | No (no products) |
| collintins | Yes (2026-02-08) | 0 | No (no products) |
| my-store | No (null) | 6 | No (no subscription) |

### Fix Required
The logic appears correct. The issue is likely that the user expects shops with products to show regardless of subscription. 

**Clarification needed:** Should shops with expired trials but with products still be visible to customers (read-only mode)?

### Proposed Enhancement
Add logging to debug production issues:

```typescript
// In shop.service.ts getShops
console.log('Raw shops fetched:', shops?.length);
console.log('Valid subscription shops:', validShops.length);
console.log('Shops with products:', shopsWithProducts.length);
console.log('Final shops:', finalShops.length);
```

---

## Part 3: Email Verification Notification

### Current Issue
After email/password signup, users are not notified to check their email for verification.

### Solution
Add a success state in Auth.tsx showing email verification instructions:

```typescript
// In Auth.tsx signup success handler
const [showEmailVerification, setShowEmailVerification] = useState(false);
const [registeredEmail, setRegisteredEmail] = useState('');

const onSignupSubmit = async (data: SignupFormData) => {
  // ... existing signup logic
  
  if (result.error) {
    setAuthError(result.error);
  } else {
    // Check if email confirmation is required
    // Supabase returns user but they need to confirm email
    setRegisteredEmail(data.email);
    setShowEmailVerification(true);
    
    toast({
      title: "Account created!",
      description: "Please check your email to verify your account.",
    });
  }
};

// Render email verification notice
{showEmailVerification && (
  <Card className="border-primary/20 bg-primary/5">
    <CardContent className="pt-6 text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
        <Mail className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold">Check Your Email</h3>
      <p className="text-muted-foreground">
        We've sent a verification link to <strong>{registeredEmail}</strong>
      </p>
      <p className="text-sm text-muted-foreground">
        Click the link in the email to activate your account.
        <br />
        <span className="text-xs">Check your spam folder if you don't see it.</span>
      </p>
      <Button variant="outline" onClick={() => setShowEmailVerification(false)}>
        Back to Login
      </Button>
    </CardContent>
  </Card>
)}
```

---

## Part 4: Unique Store Slug Enforcement

### Current State
- Database has `UNIQUE` constraint on `shop_slug`
- No frontend validation before submission

### Solution
Add real-time slug validation:

```typescript
// In MyStore.tsx
const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
const [checkingSlug, setCheckingSlug] = useState(false);

const checkSlugAvailability = useCallback(
  debounce(async (slug: string) => {
    if (!slug || slug.length < 2) {
      setSlugAvailable(null);
      return;
    }
    
    setCheckingSlug(true);
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('id')
        .eq('shop_slug', slug.toLowerCase())
        .neq('id', shop?.id || '') // Exclude current shop when editing
        .maybeSingle();
      
      setSlugAvailable(!data); // Available if no existing shop found
    } catch (error) {
      console.error('Slug check error:', error);
    } finally {
      setCheckingSlug(false);
    }
  }, 500),
  [shop?.id]
);

// In the slug input field
<div className="relative">
  <Input
    id="shop_slug"
    value={formData.shop_slug}
    onChange={(e) => {
      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData({ ...formData, shop_slug: slug });
      checkSlugAvailability(slug);
    }}
    placeholder="my-store"
    className={cn(
      errors.shop_slug && "border-red-500",
      slugAvailable === true && "border-green-500",
      slugAvailable === false && "border-red-500"
    )}
  />
  <div className="absolute right-3 top-1/2 -translate-y-1/2">
    {checkingSlug && <Loader2 className="w-4 h-4 animate-spin" />}
    {slugAvailable === true && <Check className="w-4 h-4 text-green-500" />}
    {slugAvailable === false && <X className="w-4 h-4 text-red-500" />}
  </div>
</div>
{slugAvailable === false && (
  <p className="text-sm text-red-500 mt-1">
    This slug is already taken. Try another one.
  </p>
)}
```

### Also add to shop creation service:
```typescript
// In shopService.createShop - add pre-check
const { data: existing } = await supabase
  .from('shops')
  .select('id')
  .eq('shop_slug', data.slug.toLowerCase())
  .maybeSingle();

if (existing) {
  throw new Error('This store URL is already taken. Please choose another.');
}
```

---

## Part 5: Implementation Summary

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/logistics-get-rates/index.ts` | Fetch delivery quotes |
| `supabase/functions/logistics-book-delivery/index.ts` | Book shipment |
| `supabase/functions/logistics-track/index.ts` | Track shipment |
| `supabase/functions/logistics-webhook/index.ts` | Status callbacks |
| `src/services/delivery.service.ts` | Frontend delivery service |
| `src/components/delivery/DeliveryBooking.tsx` | Rate selection UI |
| `src/components/delivery/DeliveryTracking.tsx` | Tracking display |
| `src/components/delivery/ManualDeliveryForm.tsx` | Manual booking |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Add email verification notice |
| `src/pages/MyStore.tsx` | Add slug availability check |
| `src/services/shop.service.ts` | Add slug uniqueness pre-check |
| `src/pages/Orders.tsx` | Add delivery booking option |
| `src/components/OrderTimeline.tsx` | Include delivery events |

### Database Migrations

| Migration | Tables/Changes |
|-----------|---------------|
| `create_delivery_tables.sql` | delivery_orders, delivery_tracking_events, shop_addresses |
| `add_delivery_rls.sql` | RLS policies for all delivery tables |

### Secrets Required

| Secret | Provider | Purpose |
|--------|----------|---------|
| `TERMINAL_API_KEY` | Terminal Africa | Primary logistics API |
| `SENDBOX_API_KEY` | Sendbox | Fallback logistics API |

---

## Estimated Total Effort

| Component | Hours |
|-----------|-------|
| Logistics Integration | 26h |
| Email Verification Notice | 1h |
| Slug Uniqueness Validation | 2h |
| Shops Page Debug/Fix | 1h |
| Testing & QA | 4h |
| **Total** | **34h** |

---

## JSON Summary (as requested)

```json
{
  "logistics_providers": [
    {
      "name": "Terminal Africa",
      "type": "aggregator",
      "api_docs": "https://docs.terminal.africa/tship",
      "carriers": ["GIG Logistics", "DHL", "UPS", "FedEx", "Kobo360"],
      "coverage": "Nigeria + International",
      "pricing": "Pay-per-shipment",
      "recommended": true
    },
    {
      "name": "Sendbox",
      "type": "direct",
      "api_docs": "https://docs.sendbox.co",
      "coverage": "Nigeria nationwide",
      "pricing": "Competitive local rates",
      "recommended": true
    },
    {
      "name": "GIG Logistics",
      "type": "direct",
      "api_docs": "https://giglogistics.com/developer",
      "coverage": "Nigeria nationwide",
      "pricing": "Variable by zone"
    },
    {
      "name": "SendStack",
      "type": "direct",
      "api_docs": "https://docs.sendstackhq.com",
      "coverage": "Lagos, major cities",
      "pricing": "Budget-friendly"
    }
  ],
  "backend_models": {
    "delivery_orders": {
      "fields": ["id", "order_id", "shop_id", "provider", "status", "tracking_code", "delivery_fee", "estimated_delivery_date"],
      "relationships": ["orders", "shops"]
    },
    "delivery_tracking_events": {
      "fields": ["id", "delivery_order_id", "status", "description", "location", "created_at"],
      "purpose": "Audit trail for delivery status changes"
    },
    "shop_addresses": {
      "fields": ["id", "shop_id", "label", "address", "city", "state", "is_default"],
      "purpose": "Saved pickup locations for vendors"
    }
  },
  "implementation_plan": {
    "phase_1_database": {"tasks": ["Create tables", "Add RLS policies"], "hours": 2},
    "phase_2_edge_functions": {"tasks": ["Get rates", "Book delivery", "Track", "Webhook"], "hours": 10},
    "phase_3_frontend_service": {"tasks": ["Create delivery.service.ts"], "hours": 2},
    "phase_4_ui_components": {"tasks": ["Booking UI", "Tracking UI", "Manual fallback"], "hours": 9},
    "phase_5_testing": {"tasks": ["E2E tests", "Error scenarios"], "hours": 3}
  },
  "fallback_workflow": {
    "trigger": "API failure or user preference",
    "steps": [
      "Vendor selects 'Manual Delivery'",
      "Enters carrier name and tracking number",
      "Manually updates status: Picked Up → In Transit → Delivered",
      "Customer notified via WhatsApp/Email at each step"
    ]
  },
  "bug_fixes": {
    "shops_visibility": "Logic is correct; only 2 shops meet criteria currently",
    "email_verification": "Add post-signup notice with email check instructions",
    "unique_slugs": "Add real-time availability check with debounced validation"
  }
}
```
