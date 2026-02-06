

# Fix Setup Progress & Store Status + Mobile Responsiveness

## Issues Found

### Issue 1: Double Card Nesting on Setup Progress
The `ProfileCompletionChecklist` component renders its own `<Card>` wrapper internally, but in `Dashboard.tsx` (lines 657-665) it's wrapped in **another** `<Card>`. This creates an ugly nested card-in-card layout.

**Fix:** Remove the outer Card wrapper in Dashboard.tsx and render `ProfileCompletionChecklist` directly.

### Issue 2: Store Status Card Shows Hardcoded Fake Data
The "Store Status" card in `Dashboard.tsx` (lines 690-714) displays:
- Store Visibility: always "Live" (ignores actual subscription status)
- Last Order: always "Today" (hardcoded)
- Store Rating: always "4.8 (12 reviews)" (hardcoded)

**Fix:** Replace with real data from the shop and subscription state already available in the component.

### Issue 3: Checkout Dialog Mobile Responsiveness
The CheckoutDialog already has good responsive classes (`w-[95vw]`, `sm:` breakpoints), but a few areas can be tightened:
- The bank transfer details section (lines 900-1000) has cards that don't stack well on very small screens
- Payment method selection cards need better touch targets

**Fix:** Minor padding and layout adjustments for small screens.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Remove double Card wrapper around ProfileCompletionChecklist; replace hardcoded Store Status with real data |
| `src/components/CheckoutDialog.tsx` | Minor mobile spacing fixes on bank transfer details |

---

## Technical Details

### Dashboard.tsx - Fix Setup Progress (lines 656-665)

Replace the Card-wrapped ProfileCompletionChecklist with a direct render:

```typescript
// Before (double card)
<Card>
  <CardHeader>
    <CardTitle>Setup Progress</CardTitle>
    <CardDescription>Complete your store setup</CardDescription>
  </CardHeader>
  <CardContent>
    <ProfileCompletionChecklist shop={shopFullData} productsCount={productsCount} />
  </CardContent>
</Card>

// After (direct render - component has its own Card)
<ProfileCompletionChecklist shop={shopFullData} productsCount={productsCount} />
```

### Dashboard.tsx - Fix Store Status Card (lines 690-714)

Replace hardcoded values with real data from existing state variables:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Store Status</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm">Store Visibility</span>
      <Badge variant="outline" className={
        subscriptionStatus === 'expired'
          ? "bg-red-500/10 text-red-500 border-red-500/20"
          : "bg-green-500/10 text-green-500 border-green-500/20"
      }>
        {subscriptionStatus === 'expired' ? 'Hidden' : 'Live'}
      </Badge>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm">Subscription</span>
      <span className="text-sm font-medium capitalize">{subscriptionStatus}</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm">Products Listed</span>
      <span className="text-sm font-medium">{productsCount}</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm">Store Rating</span>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">
          {shopFullData?.average_rating?.toFixed(1) || 'N/A'}
        </span>
        <span className="text-xs text-muted-foreground">
          ({shopFullData?.total_reviews || 0} reviews)
        </span>
      </div>
    </div>
  </CardContent>
</Card>
```

### CheckoutDialog.tsx - Minor Mobile Fixes

Adjust bank transfer detail cards (around lines 900-960) to use smaller padding on mobile:
- Change `p-3` to `p-2 sm:p-3` on bank detail rows
- Ensure copy buttons don't overflow on narrow screens

---

## Expected Outcomes

| Area | Before | After |
|------|--------|-------|
| Setup Progress | Double-nested cards, looks broken | Clean single card rendering |
| Store Visibility | Always shows "Live" | Shows "Live" or "Hidden" based on subscription |
| Last Order | Always "Today" | Replaced with subscription status (real data) |
| Store Rating | Always "4.8 (12 reviews)" | Shows actual shop rating from database |
| Products Listed | Not shown | Shows real count |
| Checkout mobile | Minor spacing issues | Tighter layout on small screens |

