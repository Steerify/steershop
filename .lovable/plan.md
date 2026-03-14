

# Plan: Complete AI User Test UI on AdminUXAudit Page

The backend (`ai-user-test` edge function) and config are already deployed. The only remaining work is updating `AdminUXAudit.tsx` to add a tabbed interface with the AI User Test persona results.

## Changes

**`src/pages/admin/AdminUXAudit.tsx`** — Full rewrite to add:

1. **Tabs component** — "UX Audit" tab (existing audit UI) + "AI User Test" tab (new persona UI)
2. **AI User Test tab** contains:
   - "Run User Test" button that calls `supabase.functions.invoke("ai-user-test", { body: { routes, features } })`
   - Loading state with spinner
   - **Two persona cards side-by-side** (Adaeze + Tunde), each showing:
     - Name, role, overall score (color-coded), would-recommend badge
     - Their verdict quote
     - Journey steps table with friction scores (1-5) color-coded, status badges (smooth/minor_issue/major_issue/blocker), and their Nigerian English quotes
     - Top frustrations list (red)
     - Top delights list (green)
     - Feature requests with priority badges (must_have/nice_to_have/dream)
   - **Aggregate insights section**: average score, total issues, total blockers, common frustrations, priority feature requests
3. **Types**: Add interfaces for persona results matching the edge function's tool schema output

No other files need changes — routing and sidebar already configured.

