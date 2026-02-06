

# Contact Us Button & Admin Shop Creation

## Overview

This plan implements two features:

1. **Contact Us Button** - Add a WhatsApp contact button on the storefront so customers can easily reach shop owners using the existing deeplink/weblink pattern from CheckoutDialog
2. **Admin Shop Creation** - Allow admins to create shops for existing users who haven't created one yet

---

## Feature 1: Contact Us Button on Storefront

### Current State
- The storefront (`ShopStorefront.tsx`) displays shop information including a `whatsapp_number` field
- The checkout dialog has a robust WhatsApp implementation with deep link and web link fallback
- The `TrustBadges` component shows "WhatsApp Support" badge when `hasWhatsApp` is true, but it's not clickable

### Solution

Create a **reusable WhatsApp contact utility** and add a prominent "Contact Us" button in the shop header.

### Implementation Details

#### Step 1: Create WhatsApp Utility

Create `src/utils/whatsapp.ts` to centralize the WhatsApp logic:

```typescript
// Extracted from CheckoutDialog pattern
export const openWhatsAppContact = (
  phoneNumber: string,
  shopName: string,
  customMessage?: string
) => {
  // Clean phone number
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = cleaned.startsWith('234') ? `+${cleaned}` : `+234${cleaned.replace(/^0+/, '')}`;
  }

  // Default inquiry message
  const message = customMessage || 
    `👋 Hello ${shopName}!%0A%0A` +
    `I found your shop on SteerSolo and would like to make an inquiry.%0A%0A` +
    `Please let me know more about your products/services.`;

  // Deep link + web link pattern
  const deepLink = `whatsapp://send?phone=${cleaned.replace('+', '')}&text=${message}`;
  const webLink = `https://api.whatsapp.com/send?phone=${cleaned}&text=${message}`;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    const start = Date.now();
    window.location.href = deepLink;
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.open(webLink, '_blank');
      }
    }, 1500);
  } else {
    window.open(webLink, '_blank');
  }
};
```

#### Step 2: Add Contact Button to Storefront

In `ShopStorefront.tsx`, add a "Contact Us" button in the shop header section next to the cart button:

```typescript
// Import
import { MessageCircle } from "lucide-react";
import { openWhatsAppContact } from "@/utils/whatsapp";

// In the shop header actions area (around line 350-365)
{shop.whatsapp_number && (
  <Button
    variant="outline"
    onClick={() => openWhatsAppContact(shop.whatsapp_number!, shop.shop_name)}
    className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
  >
    <MessageCircle className="w-4 h-4 mr-2" />
    Contact Us
  </Button>
)}
```

#### UI Placement

```text
┌────────────────────────────────────────────────────────────┐
│  [Shop Logo]  Shop Name                                    │
│               ⭐ 4.8 (25 reviews) | 15 Products | 3 Services│
│                                                            │
│               [Contact Us 💬]  [Cart 🛒 (2)]  [Tour ?]     │
└────────────────────────────────────────────────────────────┘
```

---

## Feature 2: Admin Shop Creation for Existing Users

### Current State
- Admins can view and manage shops via `AdminShops.tsx`
- Admins can manage users via `AdminUsers.tsx`
- Users with `role = 'shop_owner'` may exist without having created a shop
- Shop creation requires: `owner_id`, `shop_name`, `shop_slug` (all required), plus optional fields

### Solution

Add a "Create Shop" feature in the Admin Shops page that allows selecting from existing users who don't have a shop yet.

### Implementation Details

#### Step 1: Update AdminShops.tsx

Add new dialog and state for shop creation:

```typescript
// New state
const [createDialogOpen, setCreateDialogOpen] = useState(false);
const [usersWithoutShops, setUsersWithoutShops] = useState<any[]>([]);
const [newShopData, setNewShopData] = useState({
  owner_id: "",
  shop_name: "",
  description: "",
  whatsapp_number: "",
});
const [isCreating, setIsCreating] = useState(false);
```

#### Step 2: Fetch Users Without Shops

```typescript
const fetchUsersWithoutShops = async () => {
  // Get all shop owners
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("role", "shop_owner");

  // Get all shop owner_ids
  const { data: existingShops } = await supabase
    .from("shops")
    .select("owner_id");

  const shopOwnerIds = new Set(existingShops?.map(s => s.owner_id) || []);
  
  // Filter users without shops
  const usersWithout = profiles?.filter(p => !shopOwnerIds.has(p.id)) || [];
  setUsersWithoutShops(usersWithout);
};
```

#### Step 3: Auto-Generate Slug

```typescript
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50) + '-' + Date.now().toString(36).slice(-4);
};
```

#### Step 4: Create Shop Handler

```typescript
const handleCreateShop = async () => {
  if (!newShopData.owner_id || !newShopData.shop_name) {
    toast({ title: "Please fill required fields", variant: "destructive" });
    return;
  }

  setIsCreating(true);
  try {
    const slug = generateSlug(newShopData.shop_name);
    
    const { error } = await supabase
      .from("shops")
      .insert({
        owner_id: newShopData.owner_id,
        shop_name: newShopData.shop_name,
        shop_slug: slug,
        description: newShopData.description || null,
        whatsapp_number: newShopData.whatsapp_number || null,
        is_active: true,
      });

    if (error) throw error;

    toast({ 
      title: "✅ Shop Created", 
      description: `Shop "${newShopData.shop_name}" created successfully` 
    });
    
    setCreateDialogOpen(false);
    setNewShopData({ owner_id: "", shop_name: "", description: "", whatsapp_number: "" });
    fetchShops();
    
  } catch (error: any) {
    toast({ 
      title: "Error creating shop", 
      description: error.message,
      variant: "destructive" 
    });
  } finally {
    setIsCreating(false);
  }
};
```

#### Step 5: Add Create Shop Dialog UI

```typescript
{/* Create Shop Dialog */}
<Dialog open={createDialogOpen} onOpenChange={(open) => {
  setCreateDialogOpen(open);
  if (open) fetchUsersWithoutShops();
}}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Create Shop for User</DialogTitle>
      <DialogDescription>
        Create a shop for an existing user who hasn't set one up yet
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      {/* User Selection */}
      <div className="space-y-2">
        <Label>Select User *</Label>
        <Select
          value={newShopData.owner_id}
          onValueChange={(value) => setNewShopData(prev => ({ ...prev, owner_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a user without a shop" />
          </SelectTrigger>
          <SelectContent>
            {usersWithoutShops.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                All shop owners have shops
              </div>
            ) : (
              usersWithoutShops.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email} ({user.email})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* Shop Name */}
      <div className="space-y-2">
        <Label>Shop Name *</Label>
        <Input
          value={newShopData.shop_name}
          onChange={(e) => setNewShopData(prev => ({ ...prev, shop_name: e.target.value }))}
          placeholder="e.g., Adire Collections"
        />
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={newShopData.description}
          onChange={(e) => setNewShopData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the shop"
          rows={3}
        />
      </div>
      
      {/* WhatsApp */}
      <div className="space-y-2">
        <Label>WhatsApp Number</Label>
        <Input
          value={newShopData.whatsapp_number}
          onChange={(e) => setNewShopData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
          placeholder="+234 800 000 0000"
        />
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
        Cancel
      </Button>
      <Button 
        onClick={handleCreateShop} 
        disabled={isCreating || !newShopData.owner_id || !newShopData.shop_name}
      >
        {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        Create Shop
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Step 6: Add Create Button to Header

In the AdminShops header section, add a "Create Shop" button:

```typescript
<Button 
  onClick={() => setCreateDialogOpen(true)}
  className="gap-2"
>
  <Plus className="w-4 h-4" />
  Create Shop
</Button>
```

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/utils/whatsapp.ts` | Create | Reusable WhatsApp contact utility |
| `src/pages/ShopStorefront.tsx` | Modify | Add Contact Us button |
| `src/pages/admin/AdminShops.tsx` | Modify | Add Create Shop dialog and functionality |

---

## User Flows

### Contact Us Flow

```text
Customer → Shop Storefront → [Contact Us] Button
                                    ↓
                        (if WhatsApp number exists)
                                    ↓
                    Opens WhatsApp with pre-filled message
                    "👋 Hello [Shop Name]! I found your shop..."
```

### Admin Shop Creation Flow

```text
Admin → Admin Panel → Shops → [Create Shop]
                                    ↓
                        Select user without shop
                        Enter shop name, description
                                    ↓
                            [Create Shop]
                                    ↓
                    Shop created with auto-generated slug
                    User now has a functional storefront
```

---

## Summary

1. **Contact Us Button**: Prominently placed in shop header, uses proven WhatsApp deep link pattern, only shows when shop has WhatsApp configured

2. **Admin Shop Creation**: Admins can create shops for users who signed up but haven't set up their store, auto-generates slug, filters to show only users without existing shops

