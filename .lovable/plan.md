
# Fix Payment Method Selection Popup & Paystack Integration

## Problem Summary

When a shop has **both** Paystack and Bank Transfer payment methods enabled (`payment_method = 'both'`), the current checkout flow has two critical bugs:

### Bug 1: No Payment Method Selection Popup
When the customer selects "Pay Before Service" and the shop supports both payment methods, there's no UI to let the customer choose between Paystack or Bank Transfer. The code only checks for `shop.payment_method === "paystack"` which fails when the value is `'both'`.

### Bug 2: Paystack Popup Not Appearing
The Paystack payment is never triggered when `payment_method = 'both'` because:
```typescript
// Current code (line 629):
if (shop.payment_method === "paystack") {
  await handlePaystackPayment(orderId, formData.customer_email);
}
// When payment_method is 'both', this condition is false!
```

---

## Solution Overview

Add a **payment method selection step** that appears when:
1. Customer selects "Pay Before Service"
2. Shop has `payment_method = 'both'`

The flow will become:
```text
Customer Info Form → Payment Option (Pay Before/After) → [If Both Methods] Payment Method Selection → Payment Processing
```

---

## Implementation Details

### Part 1: Add Payment Method Selection State

Add new state variables to track the selected payment gateway:

```typescript
// New state
const [showPaymentMethodSelection, setShowPaymentMethodSelection] = useState(false);
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paystack' | 'bank_transfer' | null>(null);
```

### Part 2: Create Payment Method Selection UI Component

Create an inline selection component (not a separate dialog) that appears after clicking "Pay" when both methods are available:

```typescript
{/* Payment Method Selection - shown when 'both' methods available */}
{showPaymentMethodSelection && !orderCreated && (
  <div className="space-y-4 p-4 bg-muted rounded-lg">
    <h4 className="font-semibold">Choose Payment Method</h4>
    <div className="space-y-3">
      {/* Paystack Option */}
      <div 
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          selectedPaymentMethod === 'paystack' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onClick={() => setSelectedPaymentMethod('paystack')}
      >
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5" />
          <div>
            <p className="font-medium">Pay with Paystack</p>
            <p className="text-sm text-muted-foreground">Card, Bank Transfer, USSD</p>
          </div>
        </div>
      </div>
      
      {/* Bank Transfer Option */}
      <div 
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          selectedPaymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onClick={() => setSelectedPaymentMethod('bank_transfer')}
      >
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5" />
          <div>
            <p className="font-medium">Manual Bank Transfer</p>
            <p className="text-sm text-muted-foreground">Transfer to seller's account</p>
          </div>
        </div>
      </div>
    </div>
    
    <Button 
      onClick={handlePaymentMethodConfirm}
      disabled={!selectedPaymentMethod}
      className="w-full"
    >
      Continue with {selectedPaymentMethod === 'paystack' ? 'Paystack' : 'Bank Transfer'}
    </Button>
  </div>
)}
```

### Part 3: Update handleCheckout Logic

Modify the checkout handler to detect when both methods are available and show the selection:

```typescript
const handleCheckout = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation ...

  // If paying before service and both methods enabled, show selection
  if (paymentChoice === "pay_before" && shop.payment_method === "both") {
    // Don't create order yet - first let user choose payment method
    setShowPaymentMethodSelection(true);
    return;
  }

  // Otherwise proceed with order creation
  await createOrderAndProcessPayment();
};

// New function to handle order creation and payment
const createOrderAndProcessPayment = async (paymentMethod?: 'paystack' | 'bank_transfer') => {
  setIsProcessing(true);
  try {
    // ... create order ...
    
    // Determine which payment method to use
    const effectivePaymentMethod = paymentMethod || shop.payment_method;
    
    if (paymentChoice === "delivery_before") {
      await handleDeliveryBeforeService(orderId);
    } else {
      // Handle payment before service
      if (effectivePaymentMethod === "paystack" || effectivePaymentMethod === "both" && paymentMethod === "paystack") {
        await handlePaystackPayment(orderId, formData.customer_email);
      }
      // For bank transfer, the UI will show bank details
    }
  } catch (error) {
    // ... error handling ...
  } finally {
    setIsProcessing(false);
  }
};

// Handler for when user confirms payment method choice
const handlePaymentMethodConfirm = async () => {
  if (!selectedPaymentMethod) return;
  await createOrderAndProcessPayment(selectedPaymentMethod);
};
```

### Part 4: Update UI Text to Handle "Both" Case

Update the radio button description text:

```typescript
// Current (line 847-850):
{shop.payment_method === "paystack" 
  ? "Complete payment via Paystack before delivery"
  : "Transfer to shop's bank account before delivery"}

// Updated:
{shop.payment_method === "paystack" 
  ? "Complete payment via Paystack before delivery"
  : shop.payment_method === "both"
  ? "Choose Paystack or Bank Transfer"
  : "Transfer to shop's bank account before delivery"}
```

### Part 5: Fix Bank Transfer Proof Check

Update the condition that checks for bank transfer proof requirement:

```typescript
// Current (line 667):
if (!proofSent && paymentChoice === "pay_before" && shop.payment_method === "bank_transfer") {

// Updated to include 'both' case when bank transfer was selected:
const isBankTransferPayment = selectedPaymentMethod === 'bank_transfer' || 
  (shop.payment_method === 'bank_transfer' && !selectedPaymentMethod);

if (!proofSent && paymentChoice === "pay_before" && isBankTransferPayment) {
```

### Part 6: Reset States When Dialog Closes

Add the new states to the reset logic:

```typescript
useEffect(() => {
  if (!isOpen) {
    setOrderCreated(false);
    setCurrentOrderId(null);
    setProofSent(false);
    setIsInitializingPayment(false);
    setShowPaymentMethodSelection(false);  // Add this
    setSelectedPaymentMethod(null);         // Add this
  }
}, [isOpen]);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/CheckoutDialog.tsx` | Add payment method selection UI and logic |

---

## User Flow After Implementation

```text
┌─────────────────────────────────────────────────────────────────┐
│                        CHECKOUT DIALOG                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Fill customer info (auto-filled if logged in)               │
│                                                                 │
│ 2. Select: ○ Pay Before Service                                │
│            ○ Pay on Delivery                                   │
│                                                                 │
│ 3. Click "Pay ₦X"                                               │
├─────────────────────────────────────────────────────────────────┤
│ IF shop.payment_method === 'both':                              │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │ Choose Payment Method                                    │  │
│   │                                                          │  │
│   │  ┌─────────────────────────────────────────────────────┐ │  │
│   │  │ 💳 Pay with Paystack                                │ │  │
│   │  │    Card, Bank Transfer, USSD                        │ │  │
│   │  └─────────────────────────────────────────────────────┘ │  │
│   │                                                          │  │
│   │  ┌─────────────────────────────────────────────────────┐ │  │
│   │  │ 🏦 Manual Bank Transfer                             │ │  │
│   │  │    Transfer to seller's account                     │ │  │
│   │  └─────────────────────────────────────────────────────┘ │  │
│   │                                                          │  │
│   │  [Continue with Paystack]                                │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ IF Paystack selected → Opens Paystack popup                     │
│ IF Bank Transfer selected → Shows bank details + proof step     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Notes

1. **Paystack Script Loading**: The existing `loadPaystackScript()` function is already robust with error handling and retry logic

2. **CSP Configuration**: The `index.html` already includes Paystack domains in the Content Security Policy

3. **Key Validation**: The code already validates the Paystack key format (must start with `pk_`)

4. **Platform Fees**: Both payment paths (Paystack callback and frontend recording) already include the 2.5% platform fee calculation

---

## Expected Outcomes

After implementation:
1. Shops with both payment methods will show a selection popup
2. Customers can choose between Paystack or Bank Transfer
3. Paystack popup will appear correctly when selected
4. Bank transfer flow will work as before with proof requirement
5. All edge cases handled (single method shops work unchanged)
