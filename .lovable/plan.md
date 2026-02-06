

# Fix Settings for Shop Owners + Permanent Account Deletion

## Problem

1. **Settings page is generic** -- shop owners see the same basic page as customers, with no links to their store, subscription status, or identity verification.
2. **Deleted accounts can re-register** -- the current `delete-account` edge function removes the user from the auth system but does not record their email, so they can sign up again with the same email (potentially abusing free trials).

---

## Solution

### Part 1: Block Re-registration After Deletion

**1.1 New database table: `deleted_accounts`**

A table to permanently record emails of deleted users.

```text
deleted_accounts
  id         UUID (PK, auto)
  email      TEXT (unique, not null)
  role       TEXT (what role they had)
  deleted_at TIMESTAMPTZ (default now)
```

- RLS: no public access (only service role inserts via edge function)

**1.2 Database trigger on `profiles` table**

A `BEFORE INSERT` trigger on `public.profiles` that checks if the email exists in `deleted_accounts`. If it does, it raises an exception, which blocks the signup (since the `handle_new_user` trigger inserts into profiles).

This blocks both email/password and Google OAuth signups because all signups flow through the `handle_new_user` trigger which inserts into `profiles`.

**1.3 Update `delete-account` edge function**

Before deleting the user, fetch their email and role from `profiles`, then insert into `deleted_accounts`. This ensures the email is recorded before the cascade delete removes the profile.

**1.4 Update `DeleteAccountDialog` warning text**

Add a clear warning that the email can never be used again to create a new account.

---

### Part 2: Enhanced Shop Owner Settings

**Updated `Settings.tsx` to show role-specific sections for entrepreneurs:**

- **Shop Settings card** -- links to "Manage Store" (`/my-store`), "Identity Verification" (`/identity-verification`), and "View Public Store" (shop slug link)
- **Subscription card** -- shows current subscription/trial status using `ShopStatusBadge`, with link to `/subscription`
- **Security card** -- remove "Coming Soon" badge, enable password reset (calls `resetPassword` from AuthContext), show notification preferences link
- **Enhanced Danger Zone** -- extra warning for shop owners that their store, products, orders, and customer data will all be permanently deleted

The page will fetch the user's shop data and subscription status on mount.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database migration | CREATE | `deleted_accounts` table + trigger on `profiles` |
| `supabase/functions/delete-account/index.ts` | MODIFY | Record email in `deleted_accounts` before deleting user |
| `src/pages/Settings.tsx` | MODIFY | Add shop settings, subscription status, working security section |
| `src/components/auth/DeleteAccountDialog.tsx` | MODIFY | Add permanent ban warning text |

## Technical Details

### Edge Function Update

```typescript
// Before deleting, record the email
const { data: profile } = await supabase
  .from('profiles')
  .select('email, role')
  .eq('id', user.id)
  .single();

if (profile?.email) {
  await supabase
    .from('deleted_accounts')
    .insert({ 
      email: profile.email, 
      role: profile.role 
    });
}

// Then delete
await supabase.auth.admin.deleteUser(user.id);
```

### Signup Block Trigger

```sql
CREATE OR REPLACE FUNCTION public.block_deleted_email()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.deleted_accounts 
    WHERE email = NEW.email
  ) THEN
    RAISE EXCEPTION 'This email address has been permanently blocked.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_deleted_email
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.block_deleted_email();
```

### Settings Page Shop Owner Section

The page will:
1. Detect `user.role === UserRole.ENTREPRENEUR`
2. Fetch shop data from `shops` table and profile subscription info from `profiles`
3. Show a "Shop Settings" card with store management links
4. Show subscription status using the existing `ShopStatusBadge` component
5. Enable password reset functionality in the Security card
6. Show enhanced deletion warning for shop owners mentioning store/products/orders loss

