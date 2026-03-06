

# Plan: Replace Favicon & Enforce Poppins on Shop Storefront

## 1. Replace Favicon

The SteerSolo icon is currently referenced from an external Google Storage URL. We will:

- **Download and save** the image to `public/favicon.jpg` (copy from the external URL)
- **Update `index.html`** lines 61-62 to reference `/favicon.jpg` locally instead of the external URL

## 2. Enforce Poppins Font on Shop Storefront

Currently `ShopStorefront.tsx` (line 475) applies `shop.font_style` as `fontFamily`, which could be any font. We will:

- **Override** the font to always use `Poppins` by removing the dynamic `fontFamily` style from the container div (line 475)
- **Remove** the dynamic Google Fonts `<link>` injection (lines 478-482) since Poppins is already loaded globally
- This ensures all storefront text consistently uses Poppins regardless of shop settings

