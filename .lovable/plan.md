

# Fix Plan: Account Shop Visibility + Admin CRUD + Build Errors

## Summary of Issues Found

### 1. User Account Issue
**User:** Sharon Ohuche (sharonohuche294@gmail.com)
- **Shop:** "Shariè Luxe" (slug: `sharie-luxe-store`)
- **Products:** 6 available products (footwear, bags, heels, etc.)
- **Problem:** `subscription_expires_at` is NULL and `is_subscribed` is FALSE
- **Result:** Shop doesn't appear on `/shops` page due to subscription filter

**Root Cause:** The user has no active trial or subscription, so the shop filtering logic in `shop.service.ts` excludes them.

### 2. Build Errors (7 errors in total)

| File | Line | Error | Root Cause |
|------|------|-------|------------|
| `Shops.tsx` | 90 | `includeAll` doesn't exist on filter type | `getShops` doesn't accept `includeAll` parameter |
| `Shops.tsx` | 185 | `searchProducts` doesn't exist | `productService` doesn't have `searchProducts` method |
| `Shops.tsx` | 387 | `shop_slug` doesn't exist on Product | `Product` type missing `shop_slug` field |
| `Shops.tsx` | 393, 396 | `image_url` doesn't exist on Product | `Product` type uses `images` array, not `image_url` |
| `Shops.tsx` | 423 | `stock_quantity` doesn't exist on Product | `Product` type uses `inventory`, not `stock_quantity` |
| `AdminShops.tsx` | 534 | Badge doesn't accept `size` prop | Badge component has no `size` variant |

### 3. Admin CRUD Requirements
- Admin needs to extend subscriptions (this works but requires profile data)
- Admin needs full CRUD on shops and products
- Admin needs to view/update shop data and subscriptions

---

## Implementation Plan

### Part 1: Fix User Subscription (Database Update)

Execute a database migration to extend the user's subscription:

```sql
-- Extend subscription for Sharon Ohuche (sharonohuche294@gmail.com)
UPDATE profiles
SET 
  subscription_expires_at = NOW() + INTERVAL '15 days',
  is_subscribed = false  -- Keep as trial, not paid subscription
WHERE id = '67860f36-2129-41f7-a002-e0619744d607';

-- Log this extension in subscription_history
INSERT INTO subscription_history (user_id, event_type, plan_name, new_expiry_at, notes, created_by)
VALUES (
  '67860f36-2129-41f7-a002-e0619744d607',
  'trial_extension',
  'Free Trial',
  NOW() + INTERVAL '15 days',
  'Admin extended trial - shop was missing subscription',
  '63925026-8d9f-4d32-a3d3-7a6c9541dd68'
);
```

---

### Part 2: Fix Build Errors

#### 2.1 Update `shop.service.ts` - Add missing filter options

```typescript
// Update getShops signature to accept extended filters
getShops: async (page = 1, limit = 10, filters?: { 
  verified?: boolean;
  includeAll?: boolean;  // Add this
  activeOnly?: boolean;  // Add this
}) => {
  // ... existing code ...
  
  // Skip subscription/product filtering when includeAll is true (for search)
  if (filters?.includeAll) {
    return { success: true, data: mappedShops, meta: {...} };
  }
  
  // Otherwise apply normal filtering logic
  // ... rest of filtering code ...
}
```

#### 2.2 Add `searchProducts` to `product.service.ts`

```typescript
// Add new method for searching products across all shops
searchProducts: async (params: { query: string; page?: number; limit?: number }) => {
  const page = params.page || 1;
  const limit = params.limit || 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Search products by name or description
  const { data: products, error, count } = await supabase
    .from('products')
    .select(`
      *,
      shops!inner(shop_slug, shop_name, owner_id)
    `, { count: 'exact' })
    .eq('is_available', true)
    .or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`)
    .range(from, to);

  if (error) throw new Error(error.message);

  // Map to Product type with shop_slug and image_url
  const mappedProducts = (products || []).map(p => ({
    id: p.id,
    shopId: p.shop_id,
    shop_slug: p.shops?.shop_slug,  // Include for linking
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    inventory: p.stock_quantity,
    stock_quantity: p.stock_quantity,  // Include for display
    images: p.image_url ? [{ url: p.image_url, alt: p.name, position: 0 }] : [],
    image_url: p.image_url,  // Include for direct access
    is_available: p.is_available,
    type: p.type,
    averageRating: p.average_rating ? Number(p.average_rating) : undefined,
    totalReviews: p.total_reviews || 0,
  }));

  return {
    success: true,
    data: mappedProducts,
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    }
  };
}
```

#### 2.3 Update `Product` type in `types/api.ts`

```typescript
export interface Product {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  inventory: number;
  images: ProductImage[];
  averageRating?: number;
  totalReviews?: number;
  type?: 'product' | 'service';
  reviews?: any[];
  is_available?: boolean;
  duration_minutes?: number;
  booking_required?: boolean;
  // Add missing fields for search results
  shop_slug?: string;      // For linking to shop
  image_url?: string;      // Direct image URL access
  stock_quantity?: number; // Alias for inventory
}
```

#### 2.4 Fix `Shops.tsx` - Update type references

Replace references to use the correct field names or add fallbacks:
```typescript
// Line 387: Use shop_slug with fallback
to={`/shop/${product.shop_slug || 'shop'}`}

// Line 393-396: Use image_url or images array
src={product.image_url || product.images?.[0]?.url}

// Line 423: Use inventory with fallback
{product.inventory || product.stock_quantity || 0} in stock
```

#### 2.5 Fix `AdminShops.tsx` - Remove invalid `size` prop from Badge

```typescript
// Line 534: Remove size prop (Badge doesn't support it)
// Before:
<Badge variant="outline" size="sm" className="text-xs">

// After:
<Badge variant="outline" className="text-xs">
```

---

### Part 3: Admin CRUD Enhancements

#### 3.1 Create Admin Service with Subscription Management

Create `src/services/admin-subscription.service.ts`:

```typescript
const adminSubscriptionService = {
  // Extend subscription for a user
  extendSubscription: async (userId: string, days: number, adminId: string) => {
    const now = new Date();
    
    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_expires_at')
      .eq('id', userId)
      .single();
    
    // Calculate new expiry
    let newExpiry: Date;
    if (profile?.subscription_expires_at) {
      const current = new Date(profile.subscription_expires_at);
      const base = current > now ? current : now;
      newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    } else {
      newExpiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }
    
    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_expires_at: newExpiry.toISOString(),
        is_subscribed: true 
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    // Log the extension
    await supabase.from('subscription_history').insert({
      user_id: userId,
      event_type: 'admin_extension',
      new_expiry_at: newExpiry.toISOString(),
      notes: `Extended by ${days} days`,
      created_by: adminId
    });
    
    return { success: true, newExpiry };
  },
  
  // Get all shops with full details
  getAllShops: async () => {
    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        profiles:owner_id(
          id, full_name, email, is_subscribed, 
          subscription_expires_at, subscription_plan_id
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // Update any shop field
  updateShop: async (shopId: string, updates: any) => {
    const { data, error } = await supabase
      .from('shops')
      .update(updates)
      .eq('id', shopId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

---

### Part 4: Files to Modify

| File | Changes |
|------|---------|
| Database | Execute migration to fix Sharon's subscription |
| `src/services/shop.service.ts` | Add `includeAll` and `activeOnly` filter options |
| `src/services/product.service.ts` | Add `searchProducts` method |
| `src/types/api.ts` | Add `shop_slug`, `image_url`, `stock_quantity` to Product |
| `src/pages/Shops.tsx` | Fix type references, use correct field names |
| `src/pages/admin/AdminShops.tsx` | Remove `size` prop from Badge |

---

### Verification Steps After Implementation

1. **Check Sharon's shop is visible:**
   - Visit `/shops` page
   - "Shariè Luxe" should now appear with 6 products

2. **Test search functionality:**
   - Search for "heel" or "bag" on `/shops`
   - Products should appear in results

3. **Test admin functionality:**
   - Login as admin
   - Navigate to `/admin/shops`
   - Verify subscription extension works
   - Verify shop editing works

4. **Build verification:**
   - All TypeScript errors should be resolved
   - No build failures

---

### Estimated Effort

| Task | Time |
|------|------|
| Database fix for user | 5 min |
| Update shop.service.ts | 15 min |
| Add searchProducts method | 20 min |
| Update Product type | 5 min |
| Fix Shops.tsx references | 15 min |
| Fix AdminShops.tsx Badge | 5 min |
| Testing | 15 min |
| **Total** | **~1.5 hours** |

