

# Default Poppins with Optional Custom Font Override

The current code already supports custom fonts for Pro/Business shops. The only issue is that when `font_style` is not set, there's no explicit Poppins declaration — it just inherits from global CSS, which works fine.

**No code change is actually needed.** The current behavior already does exactly what you want:

1. **Default**: When a shop owner hasn't set a custom font (`font_style` is null), the storefront inherits **Poppins** from the global CSS
2. **Custom**: When a Pro/Business shop owner picks a font via the Storefront Customizer, it overrides with their chosen font

The `StorefrontCustomizer` component already has "Default (Poppins)" as the first option in the font dropdown, and the storefront code only applies a custom `fontFamily` when `shop.font_style` is truthy.

This is already working as designed — Poppins is the default, and users can change it themselves through the customizer.

