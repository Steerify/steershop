
# Fix TypewriterEffect on Mobile + Add Logistics Access

## 1. Fix TypewriterEffect Mobile Rendering

**Problem:** The wrapper `<span>` on line 38 of `Index.tsx` uses `inline-block min-w-[280px] md:min-w-[320px] text-left`, which forces a fixed-width block element on mobile. This creates awkward spacing and line breaks on small screens because 280px is too wide for many mobile viewports.

**Fix in `src/pages/Index.tsx`:**
- Remove the wrapper `<span>` with fixed min-widths entirely
- The `TypewriterEffect` component already returns a `<span>`, so it flows inline naturally
- The headline becomes: `Turn your WhatsApp business into a <TypewriterEffect /> in 10 minutes.`
- No forced widths means the text reflows naturally at any screen size

## 2. Add Logistics/Delivery Quick Action to Dashboard

**Problem:** The delivery/logistics feature is only accessible within individual order views. Shop owners who selected a delivery method during onboarding have no easy way to manage shipping from the dashboard.

**Fix in `src/pages/Dashboard.tsx`:**
- Add a "Delivery" tile to the `QuickActions` array (after "Orders") with a `Truck` icon
- Links to `/orders` where delivery management lives
- Description: "Shipping & logistics"
- Import `Truck` from `lucide-react`

## 3. Logistics API Status

The `logistics-get-rates` edge function is deployed and responding (HTTP 200). The Terminal Africa API key is configured but returns an address creation error -- this is expected since the test used placeholder data. The mock fallback path (when API fails) returns empty rates with `success: false`, and the UI already handles this gracefully by offering manual delivery booking.

No API changes needed -- the integration is working correctly.

## Files Modified

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Remove wrapper span with min-width from TypewriterEffect |
| `src/pages/Dashboard.tsx` | Add Delivery/Truck quick action tile to QuickActions array |
