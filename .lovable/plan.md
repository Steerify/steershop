# Dashboard Notifications, Public Growth Page, and Nigerian-Only Images

## Overview

Three changes: (1) a notification system in dashboards showing platform updates, (2) a public "Growth & Expansion" page for investors, and (3) replacing all Index page images with Nigerian-focused photos and using real shop owner data for the testimonial avatars section.

---

## 1. Platform Update Notifications (Dashboard)

### New Database Table: `platform_updates`

A new table to store platform announcements/updates that admins create and users see in their dashboards.


| Column          | Type        | Description                                             |
| --------------- | ----------- | ------------------------------------------------------- |
| id              | uuid (PK)   | Auto-generated                                          |
| title           | text        | Update title (e.g. "New: 1% commission on all orders")  |
| description     | text        | Short description                                       |
| type            | text        | "feature", "improvement", "announcement", "maintenance" |
| target_audience | text        | "all", "entrepreneurs", "customers"                     |
| is_active       | boolean     | Whether to show it                                      |
| created_at      | timestamptz | When created                                            |
| created_by      | uuid        | Admin who created it                                    |


RLS: Public read for active updates. Admin-only insert/update/delete.

### Admin Side: Manage Updates

- Add a "Platform Updates" menu item in the AdminSidebar
- New page `src/pages/admin/AdminPlatformUpdates.tsx` where admins can create/edit/delete platform updates and a functionality that sends it to the steersolo whatsapp community
- Simple form: title, description, type (dropdown), target audience (dropdown)
- Add route `/admin/updates` in App.tsx

### Entrepreneur Dashboard: Notification Bell

- The Bell icon in the Dashboard navbar (line 432) already exists but does nothing
- Make it open a dropdown/sheet showing recent platform updates from the `platform_updates` table
- Filter by `target_audience = 'all' OR target_audience = 'entrepreneurs'`
- Track which updates the user has "seen" via localStorage (simple approach -- store last seen timestamp)
- Show a red dot badge on the Bell when there are unseen updates

### Customer Dashboard: Notification Section

- Add a similar notification display in the CustomerDashboard
- Filter by `target_audience = 'all' OR target_audience = 'customers'`

---

## 2. Public Growth Page (for Investors)

### New Page: `src/pages/GrowthPage.tsx`

A public page at `/growth` showcasing SteerSolo's expansion metrics, pulled live from the database. This page is designed to impress investors with real data.

**Sections:**

1. **Hero:** "Our Growth Story" with a tagline about empowering Nigerian SMEs
2. **Live Metrics Dashboard:** Same data as SocialProofStats but presented in a more detailed, investor-friendly format:
  - Total registered users (from profiles count)
  - Active shops (from shops where is_active=true)
  - Total products listed
  - Total orders processed
  - Total GMV (Gross Merchandise Value -- sum of paid order amounts)
  - Platform revenue (1% of GMV)
3. **Growth Timeline:** A visual timeline of key milestones (hardcoded initially, e.g. "Jan 2026 -- Platform launched", "Feb 2026 -- 500+ shops onboarded")
4. **Categories Served:** Show the variety of business types using the platform
5. **CTA:** "Partner with us" or "Invest in SteerSolo" with a contact email

- Add route `/growth` in App.tsx (public, no auth required)
- Add a "Growth" link in the Footer

---

## 3. Nigerian-Only Images on Index Page

### Testimonial Avatars Section (lines 308-326): Use Real Users

Instead of hardcoded Unsplash stock photos, query real shops from the database and display their `logo_url` and `shop_name`. The query already confirmed real shops with logos exist (Greenace, Collintins Collections, Solo kicks, etc.).

**Implementation:**

- Make the testimonial avatars section a small component that queries `shops` table for active shops with `logo_url IS NOT NULL`, limited to 5
- Display shop logos as circular avatars with the shop name below
- Fallback to a default avatar if no shops have logos yet

### Hero Showcase Images (lines 178-203): Better Nigerian Photos

Replace the current Unsplash URLs with more specifically Nigerian/African business imagery:

- Woman at a Nigerian market stall with colorful goods
- Young Nigerian man/woman packaging products
- African entrepreneur on phone managing business
- Lagos/Nigerian market scene with vibrant products

Use carefully selected Unsplash photos that feature Nigerian/African subjects specifically.

### Banner Image (lines 284-299): Nigerian Entrepreneur

Replace the current generic desk photo with one showing a Nigerian business owner in their workspace or shop.

---

## Files to Create/Modify


| File                                       | Action                                            |
| ------------------------------------------ | ------------------------------------------------- |
| **Database migration**                     | Create `platform_updates` table with RLS          |
| `src/pages/admin/AdminPlatformUpdates.tsx` | NEW -- admin CRUD for platform updates            |
| `src/components/AdminSidebar.tsx`          | Add "Platform Updates" menu item                  |
| `src/App.tsx`                              | Add routes for `/admin/updates` and `/growth`     |
| `src/pages/GrowthPage.tsx`                 | NEW -- public investor-facing growth page         |
| `src/pages/Dashboard.tsx`                  | Wire up Bell icon to show notifications dropdown  |
| `src/pages/customer/CustomerDashboard.tsx` | Add notifications display                         |
| `src/pages/Index.tsx`                      | Replace images + make testimonial avatars dynamic |
| `src/components/Footer.tsx`                | Add "Growth" link                                 |


## Technical Notes

- The `platform_updates` table uses public SELECT RLS so all users can read active updates. Only authenticated admins (role = 'admin') can INSERT/UPDATE/DELETE.
- The Growth page queries the same data as `SocialProofStats` but presents it in a more detailed format with additional metrics like total GMV and platform revenue.
- For the testimonial avatars, the component will query `shops` with `logo_url` not null, `is_active = true`, ordered by `created_at` to show the most established shops first, limited to 5.
- localStorage key `steersolo_last_seen_updates` stores a timestamp to determine which updates are "new" for the notification badge.