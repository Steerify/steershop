
# SteerSolo Database Migration Guide

This guide will walk you through migrating your entire database (schema, functions, edge functions, users, and core data) from the existing database to a brand new Supabase project.

---

## Prerequisites
1. Install the Supabase CLI: https://supabase.com/docs/guides/cli/getting-started
2. Create a new Supabase project at https://supabase.com/dashboard
3. Make sure you have your existing project's credentials

---

## Step 1: Prepare Existing Project
First, let's make sure we're linked to the existing project:
```bash
# Check current project link
cd c:\Users\Semicolon\OneDrive\Desktop\steershop
supabase link
```

---

## Step 2: Reset Analytics & Click Data (Optional)
If you want to reset analytics/click data first, run this in your existing project's SQL Editor:
```sql
-- Copy contents from: supabase/migrations/20260618000000_reset_analytics_and_clicks.sql
```

---

## Step 3: Migrate Schema & Functions (Using Existing Migrations)
Your project already has all migrations! We just need to apply them to the new database!

### 3.1 Unlink from Existing Project
```bash
supabase link --unlink
```

### 3.2 Link to New Project
Get your new project's reference ID from your new Supabase Project Settings (General Settings > Reference ID)
```bash
supabase link --project-ref YOUR_NEW_PROJECT_REF
```

### 3.3 Push All Migrations to New Project
```bash
# This will apply ALL migrations from supabase/migrations/ to your new database!
supabase db push
```

---

## Step 4: Migrate Edge Functions
```bash
# Deploy ALL existing Edge Functions to the new project
# List your functions first
ls -la supabase/functions

# Deploy each one:
supabase functions deploy concierge-generate
supabase functions deploy mediuspay-initialize-order
supabase functions deploy mediuspay-webhook
supabase functions deploy track-visit
# ... and all other functions in supabase/functions/ directory
```

Or, if you want to deploy all functions at once:
```bash
supabase functions deploy --all
```

---

## Step 5: Migrate Environment Variables & Secrets
1. Go to your existing Supabase Project Dashboard: Project Settings > Environment Variables
2. Note down all secrets (Paystack keys, SMTP credentials, Mediuspay keys, etc.)
3. Go to your new Supabase Project Dashboard: Project Settings > Environment Variables
4. Add all of them to the new project!

Important secrets to migrate:
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (already there, but verify)
- `MEDIUSPAY_API_KEY` (new)
- `MEDIUSPAY_WEBHOOK_SECRET` (new)
- Any SMTP variables (if using custom SMTP)
- Any other API keys!

---

## Step 6: Migrate Core Data (Users, Shops, Products, Orders)
Now let's migrate core data!

### Option A: Using Supabase Dashboard (Simple)
1. Go to your **existing** project's Dashboard > Table Editor
2. For each core table:
   - Click "Export" > "CSV"
   - Save the CSV file
3. Go to your **new** project's Dashboard > Table Editor
4. For each core table:
   - Click "Import" > "CSV"
   - Upload the saved CSV
   - Make sure to check "Has headers" and map the columns correctly!

**Core tables to migrate (preserve):**
- `auth.users` (handled by Supabase Auth migration, see below)
- `public.profiles`
- `public.shops`
- `public.products`
- `public.orders`
- `public.order_items`
- `public.coupons`
- `public.subscriptions`
- `public.feedback`
- `public.reviews`

### Option B: Using Supabase CLI (Advanced)
If you're comfortable with the CLI, you can dump and restore data:
```bash
# Dump data from existing project (link to old project first!)
supabase db dump --data-only -f old_data.sql

# Link to new project and restore
supabase link --project-ref YOUR_NEW_PROJECT_REF
psql -h YOUR_NEW_DB_HOST -p 5432 -d postgres -U postgres -f old_data.sql
```

---

## Step 7: Migrate Auth Users
This is the trickiest part! Here's how to do it:

### Method 1: Supabase Auth Migration Tool (Recommended)
1. Go to: https://supabase.com/docs/guides/auth/auth-migration
2. Use the official Supabase migration tool

### Method 2: Manual CSV Export/Import (Simple)
1. Go to your **existing** project's Dashboard > Authentication > Users
2. Click "Export" > "CSV"
3. Go to your **new** project's Dashboard > Authentication > Users
4. Click "Import" and upload the CSV!

⚠️ Note: Passwords won't be migrated (Supabase doesn't export hashed passwords). Users will need to reset their passwords via "Forgot Password".

---

## Step 8: Migrate Storage Buckets & Files
1. Go to your **existing** project's Dashboard > Storage
2. For each bucket, download the files you need
3. Go to your **new** project's Dashboard > Storage
4. Create the same buckets, then upload the files!

---

## Step 9: Update Project Configuration in Code
Update your local config to point to the new project!

### 9.1 Update `supabase/config.toml`
Verify the project ref in this file is your NEW project ref!

### 9.2 Update `.env` file
Update your `.env` (and `.env.local`, `.env.production`) files with your NEW project's credentials:
- `VITE_SUPABASE_URL` (new project's URL)
- `VITE_SUPABASE_ANON_KEY` (new project's anon key)

---

## Step 10: Test Everything!
Once you've completed all steps:
1. Run the dev server: `npm run dev`
2. Test signing up/signing in
3. Test creating a shop
4. Test creating a product
5. Test checkout flow!

---

## List of Core Tables to Preserve
✅ **Do NOT reset these:**
- `auth.users` (Auth users)
- `public.profiles` (User profiles)
- `public.shops` (Shops)
- `public.products` (Products)
- `public.orders` (Orders)
- `public.order_items` (Order items)
- `public.coupons` (Coupons)
- `public.subscriptions` (Subscriptions)
- `public.reviews` (Reviews)
- `public.feedback` (Feedback)
- `public.ambassador_commission_ledger` (Ambassador data)

❌ **We reset these in our migration script:**
- `public.website_visits` (Analytics)
- `public.concierge_clicks` (Concierge clicks)
- `public.track_visits` (Shop visits)
- `public.shop_strokes` (Shop boosts)

---

## Important Notes
1. **Backup First:** Always backup your existing database before making any changes!
2. **Test in Staging:** If possible, test the migration on a staging database first!
3. **Communicate with Users:** If you're migrating a live app, let your users know about potential downtime!
4. **Webhooks:** Don't forget to update any webhook URLs (Paystack, Mediuspay, etc.) to point to your new project's Edge Functions!

---

That's it! You're ready to migrate your database to a brand new Supabase project! 🚀

