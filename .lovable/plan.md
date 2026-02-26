

# Plan: Google Business Profile Info Collection Page

## Overview

Create a multi-step form page at `/google-business-profile` for Business plan shop owners to submit all required information for Google Business Profile creation. The form starts with a consent checkbox, then walks through 4 sections matching the provided requirements.

## Database

Create a `google_business_profiles` table to store submissions:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| shop_id | uuid | FK to shops |
| user_id | uuid | owner ref |
| consent_given | boolean | must be true |
| consent_given_at | timestamptz | when consent was given |
| status | text | 'draft', 'submitted', 'in_progress', 'completed' |
| business_name | text | official name |
| physical_address | text | full address |
| is_service_area_business | boolean | SAB flag |
| service_areas | text | cities/zips if SAB |
| primary_category | text | e.g. "Italian Restaurant" |
| phone_number | text | local preferred |
| website_url | text | |
| business_hours | jsonb | { mon: {open, close}, ... } |
| business_description | text | up to 750 chars |
| services_list | text | comma/line separated |
| attributes | text[] | array of highlights |
| opening_date | text | month/year |
| logo_url | text | 720x720 |
| cover_photo_url | text | 1024x575 |
| interior_photos | text[] | array of URLs |
| exterior_photos | text[] | array of URLs |
| team_photos | text[] | array of URLs |
| verification_notes | text | free text for proof details |
| admin_notes | text | for admin use |
| created_at | timestamptz | |
| updated_at | timestamptz | |

RLS: shop owners can CRUD their own; admins can view all.

## Page: `src/pages/entrepreneur/GoogleBusinessProfile.tsx`

A stepper form with 5 steps:

1. **Consent** — explanation of what data is collected and why, with a mandatory checkbox: "I authorize SteerSolo to create and manage a Google Business Profile on behalf of my business." Must tick before proceeding.

2. **Core Business Info** — Business name, address (with SAB toggle), primary category (dropdown/combobox), phone, website, business hours grid.

3. **Profile Content** — Description (750 char limit with counter), services/products list, attributes (multi-select chips), opening date (month/year picker).

4. **Visual Assets** — Logo upload (note 720x720), cover photo (note 1024x575), interior/exterior/team photo uploads (multiple). Reuse existing `ImageUpload` component.

5. **Verification & Submit** — Verification notes textarea explaining what proof they can provide, review summary, submit button.

Auto-saves as "draft" so owners can return and complete later. On submit, status changes to "submitted" and admin sees it in their marketing consultations page.

## Route & Navigation

- Add route `/google-business-profile` in `App.tsx` (protected, entrepreneur only)
- Add a prominent CTA button in the Marketing Services page (`MarketingServices.tsx`) Google Profile tab linking to this form instead of just a URL paste field

## Admin View

- Add a section in `AdminMarketingConsultations.tsx` to list and review submitted Google Business Profile requests with status management

## Files to Create/Modify

| File | Action |
|------|--------|
| Migration SQL | Create `google_business_profiles` table with RLS |
| `src/pages/entrepreneur/GoogleBusinessProfile.tsx` | New page — full stepper form |
| `src/App.tsx` | Add route |
| `src/pages/entrepreneur/MarketingServices.tsx` | Add CTA to new page in Google Profile tab |
| `src/integrations/supabase/types.ts` | Auto-updated |

