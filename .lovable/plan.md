

# DFY Popup: Show After Onboarding + On Store/Products Pages

## Overview

Move the DFY popup trigger from the dashboard's "no shop" check to three specific moments:
1. Immediately after onboarding completion (if user chose "done_for_you" OR always as an upsell)
2. When user visits My Store page and has no shop
3. When user visits Products page and has no shop

If the user dismisses the popup, they proceed normally. The popup won't show again on Dashboard at all.

## Changes

### 1. `src/pages/entrepreneur/Onboarding.tsx`

- After `handleSubmit` succeeds, instead of navigating directly to `/dashboard`, navigate to `/dashboard?show_dfy=true`
- This query param signals the dashboard to open the DFY popup once
- Only for `shop_owner` role (customers go to customer dashboard as before)

### 2. `src/pages/Dashboard.tsx`

- Remove the current "no shop = show DFY popup" logic (lines 237-242) that auto-shows the popup when no shop exists
- Instead, check for `show_dfy=true` query param (set by onboarding redirect) and show popup if present
- Keep the existing `dfy=verify` Paystack callback logic unchanged
- Clean the `show_dfy` param from URL after showing the popup

### 3. `src/pages/MyStore.tsx`

- Import and add `DoneForYouPopup` component
- After loading shop data, if no shop exists AND `dfy_popup_dismissed` is not set in localStorage, show the DFY popup
- If user dismisses, they stay on MyStore and can set up manually
- If shop is created via DFY, reload the page data

### 4. `src/pages/Products.tsx`

- Import and add `DoneForYouPopup` component
- After loading shop data, if no shop exists AND `dfy_popup_dismissed` is not set in localStorage, show the DFY popup
- Same dismiss/create behavior as MyStore

## Technical Details

**Files modified:**

| File | Change |
|------|--------|
| `src/pages/entrepreneur/Onboarding.tsx` | Navigate to `/dashboard?show_dfy=true` after submit for shop owners |
| `src/pages/Dashboard.tsx` | Replace "no shop" auto-popup with `show_dfy` query param check |
| `src/pages/MyStore.tsx` | Add DFY popup when no shop exists |
| `src/pages/Products.tsx` | Add DFY popup when no shop exists |

**User flow:**

```text
Onboarding Complete
       |
       v
  Dashboard (DFY popup shows once)
       |
  User dismisses --> normal dashboard (no popup)
       |
  Later clicks "My Store" or "Products"
       |
  No shop? --> DFY popup again
       |
  Dismisses again --> manual setup flow
```

The `dfy_popup_dismissed` localStorage flag is only set when the user explicitly clicks "I'll set it up myself" -- so revisiting My Store/Products will keep showing the offer until they either create a shop or explicitly dismiss it.
