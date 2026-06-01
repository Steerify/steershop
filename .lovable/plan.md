# Plan: Audit Report + WhatsApp Marketing Concierge

Two deliverables in one build pass. The audit is read-only and produces a report; the bot is a real feature that runs on schedule and surfaces queued posts you tap to send.

---

## Part 1 — Vendor / Admin / Customer + Schema Audit

A read-only sweep that produces a single document, `AUDIT_REPORT_2026-06.md`, in the repo. No code is changed in this pass — you pick fixes after reviewing.

### What gets checked

**Vendor flows** (`Dashboard`, `Products`, `Orders`, `Bookings`, `Customers`, `MyStore`, `Marketing`, `AdsAssistant`, `Subscription`, `IdentityVerification`, `Settings`):
- Every Supabase call traced for: missing column refs, broken joins, RLS-blocked reads, queries that silently return empty.
- Forms checked end-to-end: do all submitted fields exist in the target table; do triggers fire; do success/error paths handle every case.
- Subscription gating actually enforced (Starter 5 / Growth 50 / Pro unlimited).

**Admin flows** (all `pages/admin/*`):
- Each admin page's data source matches an existing table/RPC.
- `has_role('admin')` actually guards every mutation.
- Activity log writes succeed.

**Customer flows** (`CustomerDashboard`, `CustomerOrders`, `CustomerWishlist`, `CustomerRewards`, `CustomerCourses`, `ShopStorefront`, `CheckoutDialog`, `ProductDetails`):
- Guest checkout path still passes RLS.
- Wishlist / reviews / rewards reach the right tables.
- Order timeline events render from real columns.

**Schema gaps** (cross-ref `src/services/*` and `src/integrations/supabase/types.ts` against live DB):
- Columns the code reads but DB doesn't have → flagged.
- Tables referenced but not present → flagged.
- Tables present but unused → flagged (candidates for removal).
- RLS policies that block intended access or expose data they shouldn't.
- Missing GRANTs on public tables.

### Report format

Findings grouped by section, each with: severity (P0 breaks feature / P1 degrades / P2 polish), file:line, root cause, suggested fix (one-line + migration snippet where relevant). At the end, a single "Fix plan" checklist you can approve in one click for a follow-up build.

I do **not** run migrations or edit code in this pass. The next message after you read the report decides scope.

---

## Part 2 — WhatsApp Marketing Concierge (semi-auto)

A scheduled engine that generates professional, varied promo posts for the SteerSolo marketplace group and queues them in an admin inbox. You (or any admin) taps **Send to Group** and WhatsApp opens pre-filled with the caption + image attached as a share. Zero ban risk, fully on-brand, runs forever once set up.

### How it works

```text
 cron (every 2h)                     admin: /admin/concierge
       │                                       │
       ▼                                       ▼
 ┌──────────────────┐    insert     ┌──────────────────────┐
 │ concierge-worker │──────────────▶│ marketing_queue table │
 │  (edge function) │               └──────────┬───────────┘
 └──────────────────┘                          │
       │                                       │ "Send to Group" button
       │ picks format + picks                  ▼
       │ shop/product + asks                ┌────────────────────────┐
       │ Lovable AI for caption             │ wa.me deep link + Web  │
       │ + image card                       │ Share API (image+text) │
       ▼                                    └────────────────────────┘
 google/gemini-2.5-flash
```

### Scheduled cadence (smart mix)

Cron job (`pg_cron` + `pg_net` → `concierge-generate` edge function) runs every 2 hours, 09:00 – 21:00 WAT:

| Slot (WAT) | Format the engine picks from |
|---|---|
| 09:00 | "Morning pick" — 1 trending product |
| 11:00 | "New arrivals" — most recent active product |
| 13:00 | "Lunch deal" — product with a `compare_price` discount |
| 15:00 | Random spotlight from a random active shop |
| 17:00 | "Top 5 products today" (carousel of 5 cards) |
| 19:00 | "Featured Store of the Day" — 1 store, story-style |
| 21:00 | Conversation starter — poll/question tied to a category |

Weighting prefers shops with `is_active=true`, paid subscription tier, recent orders, and ones that haven't been featured in 7 days (fairness).

### Caption engine

Each post asks Lovable AI Gateway (`google/gemini-2.5-flash`) with a senior-marketer system prompt:
- Warm, Naija-English, never spammy.
- One emoji opener, 1–2 sentence hook, product/store value prop, soft CTA, group-growth nudge ("Share with a friend who needs this"), trailing storefront link `https://steersolo.com/{slug}`.
- Generates 3 variants → engine picks the best by simple length+hook heuristic.

### Composed image card

For each post the engine builds a 1080×1350 (4:5) JPEG card in the worker using the product/shop image + brand strip (Adire Indigo). Stored in `marketing-posts` bucket (new). For "Top 5" the card is a 5-up collage.

### Admin Concierge inbox

New page `src/pages/admin/AdminConcierge.tsx`:
- Lists queued posts (status: `pending` / `sent` / `skipped`).
- Each card shows: composed image, caption, "Send to Group", "Skip", "Regenerate".
- **Send to Group** → opens `https://chat.whatsapp.com/C9owGcbmv03EWG65ehYQD5` in a new tab AND copies the caption to clipboard AND triggers the Web Share API with the image (mobile drops you straight into WhatsApp's recipient picker — pick the group, the image+caption are attached). On desktop it copies caption + downloads the image and opens the group.
- Marks the post `sent` after you confirm.

### Light intelligence

A `marketing_metrics` table tracks which post formats / shops / categories get clicked through (via the storefront link's `?ref=concierge_{post_id}` UTM). The engine reads the last 30 days of metrics and shifts weighting toward what performs — that is the "intelligent marketer" loop.

---

## Technical details

### New DB (migration)

```sql
-- marketing_queue: generated posts awaiting send
CREATE TABLE public.marketing_queue (
  id uuid PK default gen_random_uuid(),
  slot text not null,              -- 'morning_pick' | 'top5' | 'featured_store' | ...
  shop_id uuid, product_ids uuid[],
  caption text not null,
  image_url text,
  link_url text not null,
  status text not null default 'pending',  -- pending|sent|skipped
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz, sent_by uuid,
  created_at timestamptz default now()
);
-- GRANTs: service_role ALL; authenticated SELECT/UPDATE gated to admins via RLS

-- marketing_metrics: click-through per post
CREATE TABLE public.marketing_metrics (
  id uuid PK, post_id uuid REFERENCES marketing_queue(id),
  event text, created_at timestamptz default now(),
  meta jsonb
);

-- Storage bucket: 'marketing-posts' (public read)
```

Plus a small `marketing-posts` Storage bucket and `pg_cron` schedule calling `concierge-generate`.

### New edge functions
- `concierge-generate` — picks slot/shop/product, calls Lovable AI, composes image, inserts row in `marketing_queue`.
- `concierge-mark-sent` — admin button calls this to flip status + log metric.
- `concierge-click` — public endpoint behind the `?ref=` redirect, logs to `marketing_metrics`.

### New frontend
- `src/pages/admin/AdminConcierge.tsx` (added to `AdminSidebar`).
- `src/services/concierge.service.ts`.
- `src/utils/whatsappGroupShare.ts` — Web Share API + clipboard + invite-link opener.

### Honesty about "no human interference"
You picked semi-auto, so a human tap is required to push to the group. Generation, scheduling, caption, image, and metrics are 100% automatic — only the final WhatsApp post requires the 1-tap because WhatsApp has no official group-posting API. If at any point you want true zero-touch, the only paths are Green API (paid, ~$10/mo, your number) or a Baileys VPS worker (ToS-violating). I'd add either later as a second adapter — the queue stays the same.

---

## Out of scope for this build
- Implementing any audit fixes (separate pass after you review the report).
- True autonomous WhatsApp group posting (needs paid 3rd-party or VPS).
- Telegram cross-poster (easy add later if you want).

## Acceptance
1. `AUDIT_REPORT_2026-06.md` exists at repo root with P0/P1/P2 findings across vendor, admin, customer, and schema.
2. Cron runs every 2h and inserts a new row in `marketing_queue`.
3. `/admin/concierge` shows queued posts with image preview + caption.
4. "Send to Group" opens WhatsApp with the group invite + caption + image ready to send on mobile; on desktop it copies caption, downloads image, opens the group.
5. Click-through on the storefront link logs an event in `marketing_metrics`.