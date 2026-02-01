

# Fix Admin CRUD Operations for Shops Management

## Problem Summary

The admin panel for shops management is failing to fetch profile data and cannot perform full CRUD operations because of **missing RLS (Row-Level Security) policies** for admin users.

### Current State
| Table | SELECT | UPDATE | DELETE | INSERT |
|-------|--------|--------|--------|--------|
| `profiles` | Only own profile | Only own + admin for subscription | Not allowed | Only own |
| `shops` | Admin can view all | Only shop owners | Not allowed | Only shop owners |
| `products` | Limited | Only shop owners | Only shop owners | Only shop owners |

### Why the Admin Panel is Failing
1. **Admin cannot see profiles** - When fetching shops with owner data, the admin can fetch shops but the profile JOIN returns `null` because there's no SELECT policy allowing admins to read profiles
2. **Admin cannot update shops** - No UPDATE policy for admins exists
3. **Admin cannot delete shops** - No DELETE policy exists at all

---

## Implementation Plan

### Part 1: Add Missing RLS Policies

Create a database migration to add admin policies:

```sql
-- Allow admins to view all profiles (needed for shop owner data)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all shops
CREATE POLICY "Admins can update all shops"
  ON public.shops FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete shops
CREATE POLICY "Admins can delete shops"
  ON public.shops FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage all products
CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

### Part 2: Update Admin Service with Full CRUD

Enhance `admin.service.ts` with comprehensive shop management:

```typescript
const adminService = {
  // ... existing methods ...

  // Get all shops with full profile data
  getAllShopsWithProfiles: async () => {
    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        profiles:owner_id(
          id, full_name, email, phone, is_subscribed,
          subscription_expires_at, subscription_plan_id, role, created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Update any shop
  updateShop: async (shopId: string, updates: Partial<Shop>) => {
    const { data, error } = await supabase
      .from('shops')
      .update(updates)
      .eq('id', shopId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a shop
  deleteShop: async (shopId: string) => {
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopId);

    if (error) throw error;
    return { success: true };
  },

  // Extend user subscription
  extendSubscription: async (
    userId: string, 
    days: number, 
    adminId: string
  ) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_expires_at')
      .eq('id', userId)
      .single();

    const now = new Date();
    let newExpiry: Date;

    if (profile?.subscription_expires_at) {
      const current = new Date(profile.subscription_expires_at);
      const base = current > now ? current : now;
      newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    } else {
      newExpiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

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

  // Get all products with shop info
  getAllProducts: async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops(shop_name, shop_slug)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Update any product
  updateProduct: async (productId: string, updates: any) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete any product
  deleteProduct: async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return { success: true };
  }
};
```

### Part 3: Update AdminShops.tsx

The existing `AdminShops.tsx` already has the UI for:
- Viewing shops with owner data ✓
- Editing shop details ✓
- Extending subscriptions ✓
- Activating/deactivating shops ✓

Once the RLS policies are in place, the existing code will work because:
1. The profile JOIN query will return data (currently returns `null` due to missing SELECT policy)
2. The shop UPDATE operations will succeed
3. We'll add a delete confirmation dialog for removing shops

Add delete shop functionality:

```typescript
// In AdminShops.tsx
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [shopToDelete, setShopToDelete] = useState<any>(null);

const handleDeleteShop = (shop: any) => {
  setShopToDelete(shop);
  setDeleteDialogOpen(true);
};

const confirmDeleteShop = async () => {
  if (!shopToDelete) return;
  
  try {
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopToDelete.id);

    if (error) throw error;

    toast({ title: "Shop deleted successfully" });
    setDeleteDialogOpen(false);
    setShopToDelete(null);
    fetchShops();
  } catch (error: any) {
    toast({ 
      title: "Error deleting shop", 
      description: error.message,
      variant: "destructive" 
    });
  }
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| Database Migration | Add admin RLS policies for profiles, shops, products |
| `src/services/admin.service.ts` | Add comprehensive CRUD methods |
| `src/pages/admin/AdminShops.tsx` | Add delete shop functionality with confirmation |

---

## Expected Outcomes

After implementation:

1. **Admin can view all shop owner profiles** - Profile data will show in the shops table
2. **Admin can edit any shop** - Update name, description, WhatsApp, status
3. **Admin can delete shops** - With confirmation dialog
4. **Admin can extend subscriptions** - Already works, will be more reliable
5. **Admin can manage products** - Full CRUD on any product

---

## Security Considerations

All admin policies use the `has_role(auth.uid(), 'admin'::app_role)` function which:
- Validates against the `user_roles` table (not profiles)
- Uses `SECURITY DEFINER` to prevent recursive RLS issues
- Cannot be bypassed by client-side manipulation

