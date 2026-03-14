

# Plan: AI User Testing System with 2 Simulated Personas

## What We're Building

An admin tool that simulates **2 AI personas** — one shop owner ("Adaeze") and one customer ("Tunde") — who mentally walk through every feature of the platform and provide structured, honest feedback as if they were real Nigerian users. The results are displayed as a detailed report with actionable insights.

This extends the existing `/admin/ux-audit` page with a new "AI User Test" tab.

## The 2 AI Personas

1. **Adaeze** (Shop Owner) — A Lagos fashion entrepreneur, semi-technical, selling on WhatsApp/Instagram. Tests: signup → onboarding → shop creation → product upload → order management → payments → marketing tools → subscription → settings.

2. **Tunde** (Customer) — A Abuja-based buyer who shops online via social media links. Tests: browsing shops → product discovery → checkout → WhatsApp ordering → order tracking → wishlist → reviews → rewards → courses.

## Architecture

### Backend: New edge function `ai-user-test`
- Takes persona definitions + full route/feature lists
- Makes 2 sequential AI calls (one per persona) to Lovable AI
- Each persona "walks through" their relevant features and rates them
- Returns structured feedback per persona with:
  - Journey steps (what they tried, what happened, friction score 1-5)
  - Overall satisfaction score
  - Top 3 frustrations
  - Top 3 delights
  - "Would I recommend this?" verdict
  - Feature requests from a real user perspective

### Frontend: New tab on AdminUXAudit page
- Add "AI User Test" tab alongside the existing "UX Audit" tab
- Shows both personas side-by-side in cards
- Each persona card shows their journey, ratings, quotes, and recommendations
- Aggregate insights section: common pain points, priority fixes

## Files Changed

1. **`supabase/functions/ai-user-test/index.ts`** — New edge function with 2 AI calls
2. **`supabase/config.toml`** — Add `[functions.ai-user-test]` entry
3. **`src/pages/admin/AdminUXAudit.tsx`** — Add tabs: "UX Audit" + "AI User Test", new UI for persona results

## Key Implementation Details

- Each persona gets a detailed system prompt describing who they are, their tech comfort level, and what they're trying to accomplish
- The AI is instructed to be brutally honest — flag things that would make a real user abandon the platform
- Tool calling is used for structured output (journey steps, scores, recommendations)
- Both personas run in parallel (2 concurrent AI calls) for speed
- Results include quotable "user voice" feedback that reads like real testimonials

