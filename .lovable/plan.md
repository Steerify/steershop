

# Plan: Real Nigerian Images + Email Authentication Fix

## Part 1: Replace Images with Real Nigerian Vendor Photos

### Problem
Current Unsplash images are generic — many depict non-Nigerian subjects (e.g., `photo-1531746020798` is a generic portrait, `photo-1556740758` is generic commerce). SteerSolo's brand requires authentic Nigerian entrepreneur imagery.

### Approach
Replace all photo URLs in `src/pages/Index.tsx` (the `P` object) and `src/pages/DemoStoreFront.tsx` with carefully selected Unsplash photos that specifically feature:
- **Nigerian/African women entrepreneurs** selling products
- **Beauty products** in African market contexts (shea butter, skincare, braiding)
- **Mobile phone commerce** scenes (WhatsApp selling)
- **African market/shop** environments
- **Nigerian fashion** (Ankara, lace, gele)

Each URL will be tested in a browser before committing. Specific replacements:

| Image Key | New Subject |
|---|---|
| `heroVendor` | African woman entrepreneur with products/phone |
| `heroProducts` | African beauty/skincare products display |
| `trustFace` | Confident Nigerian businesswoman portrait |
| `organic` | Natural African beauty ingredients (shea, black soap) |
| `orders` | African vendor packaging/shipping products |
| `storefront` | Nigerian shop owner at her store |
| `whatsapp` | African person using phone for business |
| `av1-av3` | Nigerian women entrepreneur headshots |
| Demo store logo | Nigerian fashion vendor |
| Demo store banner | African fashion display |
| Demo product images | Ankara/lace/African fashion items |

### Files
- `src/pages/Index.tsx` — Replace `P` object URLs
- `src/pages/DemoStoreFront.tsx` — Replace demo shop images

---

## Part 2: Fix Email Authentication

### Current State
The `auth-email-hook` edge function uses **Resend directly** (old pattern). The domain `notify.steersolo.com` is verified. However, this old pattern bypasses the Lovable managed email queue, which means:
- No retry on failure
- No rate-limit handling
- No send logging

### Fix
Re-scaffold the auth-email-hook using Lovable's managed email system (queue-based), then re-apply brand styling and redeploy. This ensures email auth works reliably through the managed infrastructure.

Steps:
1. Call `scaffold_auth_email_templates` (with `confirm_overwrite: true`)
2. Re-apply SteerSolo brand styling (Adire Indigo primary, Nigerian Green accent, logo, copy tone)
3. Deploy `auth-email-hook`
4. Verify the queue infrastructure exists (setup_email_infra if needed)

### Files affected
- `supabase/functions/auth-email-hook/index.ts` — Replaced by scaffold
- `supabase/functions/_shared/email-templates/*.tsx` — Re-branded

