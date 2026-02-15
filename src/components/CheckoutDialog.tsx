import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { couponService } from "@/services/coupon.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Minus, Plus, ShoppingCart, Trash2, CreditCard, MessageCircle, Copy, Check, Upload, Camera, User, Building2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { saveCheckoutDraft, clearCheckoutDraft } from "@/store/slices/formSlice";
import { clearCart } from "@/store/slices/cartSlice";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  shop: {
    id: string;
    shop_name: string;
    payment_method?: string;
    bank_account_name?: string;
    bank_name?: string;
    bank_account_number?: string;
    paystack_public_key?: string;
    whatsapp_number?: string;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  totalAmount: number;
}

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  customer_email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  customer_phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20, "Phone number too long"),
  delivery_address: z.string().trim().min(10, "Address must be at least 10 characters").max(500, "Address too long"),
});

// Paystack utilities
const loadPaystackScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (typeof window.PaystackPop !== 'undefined') {
      console.log("Paystack script already loaded");
      resolve(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existingScript) {
      console.log("Paystack script already exists, waiting for load...");
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    console.log("Loading Paystack script...");
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      console.log("Paystack script loaded successfully");
      resolve(true);
    };
    
    script.onerror = (error) => {
      console.error("Failed to load Paystack script - may be blocked by CSP or network issue:", error);
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
};

const initializePaystackPayment = (config: {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  callback?: (response: any) => void;
  onClose?: () => void;
}) => {
  if (typeof window.PaystackPop === 'undefined') {
    console.error('Paystack script not loaded');
    return false;
  }

  try {
    const handler = window.PaystackPop.setup({
      key: config.key,
      email: config.email,
      amount: config.amount * 100,
      currency: config.currency || 'NGN',
      ref: config.ref || `PS_${Math.floor((Math.random() * 1000000000) + 1)}`,
      callback: (response: any) => {
        if (config.callback) {
          config.callback(response);
        }
      },
      onClose: () => {
        if (config.onClose) {
          config.onClose();
        }
      },
    });

    handler.openIframe();
    return true;
  } catch (error) {
    console.error('Error initializing Paystack:', error);
    return false;
  }
};

// Enhanced WhatsApp function with deep link and web link fallback
const openWhatsAppWithOrderDetails = (
  shopWhatsappNumber: string,
  orderDetails: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    cart: CartItem[];
    totalAmount: number;
    paymentReference?: string;
    shopName: string;
    paymentMethod: string;
    requiresProof?: boolean;
  }
) => {
  if (!shopWhatsappNumber) {
    console.error("WhatsApp number not configured");
    return false;
  }

  // Clean the phone number - remove all non-digits except leading +
  let cleaned = shopWhatsappNumber.replace(/[^\d+]/g, '');
  // Ensure it has country code
  if (!cleaned.startsWith('+')) {
    cleaned = cleaned.startsWith('234') ? `+${cleaned}` : `+234${cleaned.replace(/^0+/, '')}`;
  }
  const phoneNumber = cleaned;

  // Create detailed order summary
  const orderSummary = orderDetails.cart.map(item => 
    `• ${item.product.name} x ${item.quantity} - ₦${(item.product.price * item.quantity).toLocaleString()}`
  ).join('%0A');

  let message = '';

  if (orderDetails.requiresProof) {
    // Bank transfer proof submission message
    message = `🧾 *PAYMENT PROOF SUBMISSION*%0A%0A` +
      `Hello ${orderDetails.shopName},%0A%0A` +
      `I have made a bank transfer payment for my order. Please find my payment proof attached.%0A%0A` +
      `*📋 ORDER DETAILS:*%0A` +
      `Order ID: ${orderDetails.orderId}%0A` +
      `Amount Paid: ₦${orderDetails.totalAmount.toLocaleString()}%0A%0A` +
      `*📦 ORDER ITEMS:*%0A` +
      `${orderSummary}%0A%0A` +
      `*👤 CUSTOMER INFO:*%0A` +
      `Name: ${orderDetails.customerName}%0A` +
      `Phone: ${orderDetails.customerPhone}%0A` +
      `Email: ${orderDetails.customerEmail}%0A` +
      `Delivery Address: ${orderDetails.deliveryAddress}%0A%0A` +
      `⚠️ *PLEASE ATTACH YOUR PAYMENT SCREENSHOT TO THIS MESSAGE*`;
  } else if (orderDetails.paymentMethod === 'delivery_before') {
    // Pay after service message
    message = `📦 *ORDER REQUEST - PAY ON DELIVERY*%0A%0A` +
      `Hello ${orderDetails.shopName},%0A%0A` +
      `I would like to place an order and pay upon delivery. Please confirm if you can fulfill this order:%0A%0A` +
      `*📦 ORDER ITEMS:*%0A` +
      `${orderSummary}%0A%0A` +
      `*💰 TOTAL AMOUNT:*%0A` +
      `₦${orderDetails.totalAmount.toLocaleString()}%0A%0A` +
      `*📋 PAYMENT STATUS:*%0A` +
      `⚠️ UNPAID - Will pay on delivery%0A%0A` +
      `*👤 CUSTOMER INFO:*%0A` +
      `Name: ${orderDetails.customerName}%0A` +
      `Phone: ${orderDetails.customerPhone}%0A` +
      `Email: ${orderDetails.customerEmail}%0A` +
      `Delivery Address: ${orderDetails.deliveryAddress}%0A%0A` +
      `Order ID: ${orderDetails.orderId}%0A%0A` +
      `Please confirm availability and delivery timeline.`;
  } else {
    // Paystack payment success message
    message = `🎉 *PAYMENT SUCCESSFUL*%0A%0A` +
      `Hello ${orderDetails.shopName},%0A%0A` +
      `I have completed my order and payment. Here are the details:%0A%0A` +
      `*📦 ORDER ITEMS:*%0A` +
      `${orderSummary}%0A%0A` +
      `*💰 PAYMENT DETAILS:*%0A` +
      `Total: ₦${orderDetails.totalAmount.toLocaleString()}%0A` +
      `Reference: ${orderDetails.paymentReference || 'N/A'}%0A` +
      `Status: ✅ PAID%0A%0A` +
      `*👤 CUSTOMER INFO:*%0A` +
      `Name: ${orderDetails.customerName}%0A` +
      `Phone: ${orderDetails.customerPhone}%0A` +
      `Email: ${orderDetails.customerEmail}%0A` +
      `Delivery Address: ${orderDetails.deliveryAddress}%0A%0A` +
      `Order ID: ${orderDetails.orderId}%0A%0A` +
      `Please confirm delivery timeline.`;
  }

  // Create deep link and web link
  const deepLink = `whatsapp://send?phone=${phoneNumber.replace('+', '')}&text=${message}`;
  const webLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

  // Detect mobile vs desktop
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    // Try deep link first with fallback
    const start = Date.now();
    window.location.href = deepLink;

    // Fallback to web link if deep link doesn't work
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.open(webLink, '_blank');
      }
    }, 1500);
  } else {
    // Desktop: use web link directly
    window.open(webLink, '_blank');
  }

  return true;
};

const CheckoutDialog = ({ isOpen, onClose, cart, shop, onUpdateQuantity, totalAmount }: CheckoutDialogProps) => {
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const dispatch = useAppDispatch();
  const checkoutDraft = useAppSelector((state) => state.forms.checkoutDraft);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<"pay_before" | "delivery_before">("delivery_before");
  const [formData, setFormData] = useState({
    customer_name: checkoutDraft?.customerName || "",
    customer_email: checkoutDraft?.customerEmail || "",
    customer_phone: checkoutDraft?.customerPhone || "",
    delivery_address: checkoutDraft?.deliveryAddress || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [proofSent, setProofSent] = useState(false);
  const [showPaymentMethodSelection, setShowPaymentMethodSelection] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paystack' | 'bank_transfer' | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const effectiveTotal = Math.max(0, totalAmount - couponDiscount);

  // Save form data to Redux on change
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    dispatch(saveCheckoutDraft({
      customerName: field === 'customer_name' ? value : formData.customer_name,
      customerEmail: field === 'customer_email' ? value : formData.customer_email,
      customerPhone: field === 'customer_phone' ? value : formData.customer_phone,
      deliveryAddress: field === 'delivery_address' ? value : formData.delivery_address,
    }));
  };

  // Auto-fill customer info for logged-in users
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isOpen || isAuthLoading) return;

      try {
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            setFormData(prev => ({
              ...prev,
              customer_name: profile.full_name || prev.customer_name,
              customer_email: profile.email || prev.customer_email,
              customer_phone: profile.phone || prev.customer_phone,
            }));
            setIsUserLoggedIn(true);
          }
        } else {
          setIsUserLoggedIn(false);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };

    loadUserProfile();
  }, [isOpen, user, isAuthLoading]);

  // Reset states when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setOrderCreated(false);
      setCurrentOrderId(null);
      setProofSent(false);
      setIsInitializingPayment(false);
      setShowPaymentMethodSelection(false);
      setSelectedPaymentMethod(null);
      setCouponCode("");
      setCouponDiscount(0);
      setAppliedCoupon(null);
    }
  }, [isOpen]);

  // Send order notification (fire-and-forget)
  const sendOrderNotification = async (orderId: string, eventType: string, extra?: Record<string, any>) => {
    try {
      await supabase.functions.invoke('order-notifications', {
        body: {
          orderId,
          eventType,
          shopName: shop.shop_name,
          customerEmail: formData.customer_email,
          customerName: formData.customer_name,
          totalAmount: effectiveTotal,
          items: cart.map(item => ({ name: item.product.name, quantity: item.quantity, price: item.product.price })),
          ...extra,
        },
      });
    } catch (e) {
      console.error('Notification failed (non-blocking):', e);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const result = await couponService.validateCoupon(couponCode, shop.id, totalAmount);
      if (result.valid) {
        setCouponDiscount(result.discount);
        setAppliedCoupon(result.coupon);
        toast({ title: "Coupon Applied! 🎉", description: `You saved ₦${result.discount.toLocaleString()}` });
      } else {
        toast({ title: "Invalid Coupon", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to validate coupon", variant: "destructive" });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setAppliedCoupon(null);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const handlePaystackPayment = async (orderId: string, customerEmail: string) => {
    setIsInitializingPayment(true);

    try {
      if (!customerEmail?.trim()) {
        throw new Error("Email is required for payment");
      }

      console.log("Initializing split payment via backend:", {
        order_id: orderId,
        shop_id: shop.id,
        amount: effectiveTotal,
        email: customerEmail,
      });

      // Call the backend edge function to initialize split payment
      const { data, error: fnError } = await supabase.functions.invoke('paystack-initialize-order', {
        body: {
          order_id: orderId,
          shop_id: shop.id,
          amount: effectiveTotal,
          customer_email: customerEmail,
          callback_url: window.location.origin + '/customer/orders',
        },
      });

      if (fnError || !data?.success) {
        const errorMsg = data?.error || fnError?.message || 'Failed to initialize payment';
        if (data?.code === 'NO_SUBACCOUNT') {
          throw new Error("This shop hasn't set up their bank details for receiving payments yet. Please choose 'Pay on Delivery' or contact the seller.");
        }
        throw new Error(errorMsg);
      }

      // Update order with payment reference
      await supabase
        .from("orders")
        .update({ payment_reference: data.data.reference })
        .eq("id", orderId);

      // Redirect to Paystack checkout page
      window.location.href = data.data.authorization_url;

    } catch (error: any) {
      console.error("Payment initialization error:", error);
      setIsInitializingPayment(false);
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again or use bank transfer",
        variant: "destructive",
      });
    }
  };

  const handleDeliveryBeforeService = async (orderId: string) => {
    try {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ 
          status: "awaiting_approval",
          payment_status: "unpaid"
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      const whatsappOpened = openWhatsAppWithOrderDetails(shop.whatsapp_number || '', {
        orderId,
        customerName: formData.customer_name,
        customerEmail: formData.customer_email,
        customerPhone: formData.customer_phone,
        deliveryAddress: formData.delivery_address,
        cart,
        totalAmount,
        shopName: shop.shop_name,
        paymentMethod: "delivery_before"
      });

      if (whatsappOpened) {
        toast({
          title: "Order Request Sent! 📦",
          description: "WhatsApp opened for you to discuss with the seller.",
          duration: 6000,
        });
      }

      cart.forEach((item) => onUpdateQuantity(item.product.id, 0));
      resetForm();
      onClose();

    } catch (error: any) {
      console.error("Error in delivery before service:", error);
      toast({
        title: "Order Request Submitted!",
        description: "Your order request has been saved. The seller will contact you.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      delivery_address: "",
    });
    setOrderCreated(false);
    setCurrentOrderId(null);
    setProofSent(false);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = checkoutSchema.safeParse(formData);

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // If paying before service and both methods enabled, show selection first
    if (paymentChoice === "pay_before" && shop.payment_method === "both" && !selectedPaymentMethod) {
      setShowPaymentMethodSelection(true);
      return;
    }

    await createOrderAndProcessPayment(selectedPaymentMethod || undefined);
  };

  // New function to handle order creation and payment
  const createOrderAndProcessPayment = async (paymentMethod?: 'paystack' | 'bank_transfer') => {
    setIsProcessing(true);

    try {
      const orderId = crypto.randomUUID();

      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          id: orderId,
          shop_id: shop.id,
          customer_id: user?.id || null,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          delivery_address: formData.delivery_address,
          total_amount: effectiveTotal,
          status: paymentChoice === "delivery_before" ? "awaiting_approval" : "pending",
          payment_status: paymentChoice === "pay_before" ? "pending" : "unpaid",
        });

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      const orderItems = cart.map((item) => ({
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setCurrentOrderId(orderId);
      setOrderCreated(true);
      setShowPaymentMethodSelection(false);

      // Increment coupon usage if applied
      if (appliedCoupon) {
        couponService.incrementUsage(appliedCoupon.id).catch(console.error);
      }

      // Send order notification (fire-and-forget)
      sendOrderNotification(orderId, "order_placed");

      // Handle payment choice
      if (paymentChoice === "delivery_before") {
        await handleDeliveryBeforeService(orderId);
      } else {
        // Determine which payment method to use
        const effectivePaymentMethod = paymentMethod || shop.payment_method;
        
        // Handle payment before service - trigger Paystack for paystack or when selected via "both"
        if (effectivePaymentMethod === "paystack" || (shop.payment_method === "both" && paymentMethod === "paystack")) {
          await handlePaystackPayment(orderId, formData.customer_email);
        }
        // For bank transfer, the UI will show bank details and require proof
      }
      
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for when user confirms payment method choice
  const handlePaymentMethodConfirm = async () => {
    if (!selectedPaymentMethod) return;
    await createOrderAndProcessPayment(selectedPaymentMethod);
  };

  const handleSendProofViaWhatsApp = () => {
    if (!currentOrderId) return;

    openWhatsAppWithOrderDetails(shop.whatsapp_number || '', {
      orderId: currentOrderId,
      customerName: formData.customer_name,
      customerEmail: formData.customer_email,
      customerPhone: formData.customer_phone,
      deliveryAddress: formData.delivery_address,
      cart,
      totalAmount,
      shopName: shop.shop_name,
      paymentMethod: "pay_before",
      requiresProof: true
    });

    setProofSent(true);
  };

  const handleCompleteOrder = () => {
    // Check if bank transfer proof is required
    const isBankTransferPayment = selectedPaymentMethod === 'bank_transfer' || 
      (shop.payment_method === 'bank_transfer' && !selectedPaymentMethod);

    if (!proofSent && paymentChoice === "pay_before" && isBankTransferPayment) {
      toast({
        title: "Please send payment proof first",
        description: "You must send your payment proof via WhatsApp before completing the order.",
        variant: "destructive",
      });
      return;
    }

    cart.forEach((item) => onUpdateQuantity(item.product.id, 0));
    resetForm();
    onClose();
    
    toast({
      title: "Order Submitted",
      description: "Thank you! The shop owner will verify your payment and process your order.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">Checkout - {shop.shop_name}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {showPaymentMethodSelection && !orderCreated
              ? "Choose how you'd like to pay"
              : orderCreated && paymentChoice === "pay_before" && (shop.payment_method === "bank_transfer" || selectedPaymentMethod === "bank_transfer")
              ? "Make payment and send proof via WhatsApp"
              : isInitializingPayment
              ? "Initializing payment gateway..."
              : "Complete your order"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Cart Items */}
          <div>
            <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Your Cart</h3>
            <div className="space-y-2 sm:space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{item.product.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">₦{item.product.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_quantity}
                        className="h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => onUpdateQuantity(item.product.id, 0)}
                        className="h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                    
                    <div className="font-semibold text-sm sm:text-base min-w-[80px] sm:w-24 text-right">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal:</span>
                <span className="text-sm">₦{totalAmount.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm">Coupon ({appliedCoupon?.code}):</span>
                  <span className="text-sm">-₦{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-semibold">Total:</span>
                <span className="text-xl sm:text-2xl font-bold">₦{effectiveTotal.toLocaleString()}</span>
              </div>

              {/* Coupon Input */}
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="min-h-[40px] text-sm"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode.trim()} className="min-h-[40px] whitespace-nowrap">
                    {isApplyingCoupon ? "..." : "Apply"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-sm text-green-700 dark:text-green-400 font-medium">✓ {appliedCoupon.code}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={removeCoupon} className="text-xs h-7">Remove</Button>
                </div>
              )}
            </div>
          </div>

          {!orderCreated ? (
            <form onSubmit={handleCheckout} className="space-y-3 sm:space-y-4">
              {/* Auto-fill indicator for logged-in users */}
              {isUserLoggedIn && (
                <div className="p-2 sm:p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2">
                  <User className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-primary font-medium">
                    Logged in - your info has been auto-filled
                  </span>
                </div>
              )}

              {/* Form fields */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="customer_name" className="text-sm">Full Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleFormChange('customer_name', e.target.value)}
                  placeholder="John Doe"
                  className={`min-h-[44px] ${errors.customer_name ? "border-destructive" : ""}`}
                />
                {errors.customer_name && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.customer_name}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="customer_email" className="text-sm">Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleFormChange('customer_email', e.target.value)}
                  placeholder="john@example.com"
                  className={`min-h-[44px] ${errors.customer_email ? "border-destructive" : ""}`}
                />
                {errors.customer_email && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.customer_email}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="customer_phone" className="text-sm">Phone Number *</Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => handleFormChange('customer_phone', e.target.value)}
                  placeholder="+234 800 000 0000"
                  className={`min-h-[44px] ${errors.customer_phone ? "border-destructive" : ""}`}
                />
                {errors.customer_phone && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.customer_phone}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="delivery_address" className="text-sm">Delivery Address *</Label>
                <Textarea
                  id="delivery_address"
                  value={formData.delivery_address}
                  onChange={(e) => handleFormChange('delivery_address', e.target.value)}
                  placeholder="Enter your full delivery address including landmarks"
                  rows={3}
                  className={`min-h-[80px] ${errors.delivery_address ? "border-destructive" : ""}`}
                />
                {errors.delivery_address && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.delivery_address}</p>
                )}
              </div>

              {/* Payment Choice */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm">Payment Option *</Label>
                <RadioGroup
                  value={paymentChoice}
                  onValueChange={(value: "pay_before" | "delivery_before") => setPaymentChoice(value)}
                  className="space-y-2"
                >
                  <div className="flex items-start space-x-2 sm:space-x-3 p-2.5 sm:p-3 border rounded-lg hover:bg-muted cursor-pointer min-h-[60px]">
                    <RadioGroupItem value="pay_before" id="pay_before" className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="pay_before" className="font-medium cursor-pointer flex items-center gap-2 text-sm sm:text-base">
                        <CreditCard className="w-4 h-4 flex-shrink-0" />
                        <span>Pay Before Service</span>
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {shop.payment_method === "paystack" 
                          ? "Complete payment via Paystack before delivery"
                          : shop.payment_method === "both"
                          ? "Choose Paystack or Bank Transfer"
                          : "Transfer to shop's bank account before delivery"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 sm:space-x-3 p-2.5 sm:p-3 border rounded-lg hover:bg-muted cursor-pointer min-h-[60px]">
                    <RadioGroupItem value="delivery_before" id="delivery_before" className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="delivery_before" className="font-medium cursor-pointer flex items-center gap-2 text-sm sm:text-base">
                        <MessageCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Pay on Delivery</span>
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Pay when your order arrives. We'll contact you via WhatsApp to confirm.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Method Selection - shown when 'both' methods available */}
              {showPaymentMethodSelection && paymentChoice === "pay_before" && shop.payment_method === "both" && !orderCreated && (
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
                    disabled={!selectedPaymentMethod || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Continue with ${selectedPaymentMethod === 'paystack' ? 'Paystack' : selectedPaymentMethod === 'bank_transfer' ? 'Bank Transfer' : '...'}`
                    )}
                  </Button>
                </div>
              )}

              {/* Show bank details preview for "Pay Before" with bank transfer only */}
              {paymentChoice === "pay_before" && shop.payment_method === "bank_transfer" && !showPaymentMethodSelection && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-semibold">Bank Transfer Details (Preview)</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Account Name:</span> {shop.bank_account_name}</p>
                    <p><span className="font-medium">Bank:</span> {shop.bank_name}</p>
                    <p><span className="font-medium">Account Number:</span> {shop.bank_account_number}</p>
                    <p className="text-muted-foreground text-xs mt-2">
                      After placing the order, you'll need to transfer and send proof via WhatsApp.
                    </p>
                  </div>
                </div>
              )}

              {/* Hide submit buttons when payment method selection is shown */}
              {!showPaymentMethodSelection && (
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-4">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing || isInitializingPayment} className="min-h-[48px] w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isProcessing || cart.length === 0 || isInitializingPayment} 
                    className="flex-1 min-h-[48px] text-sm sm:text-base"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isInitializingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : paymentChoice === "delivery_before" ? (
                      <span className="truncate">Place Order - ₦{totalAmount.toLocaleString()}</span>
                    ) : (
                      <span className="truncate">Pay ₦{totalAmount.toLocaleString()}</span>
                    )}
                  </Button>
                </div>
              )}
            </form>
          ) : isInitializingPayment ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Initializing payment gateway...</p>
            </div>
          ) : orderCreated && (shop.payment_method === "bank_transfer" || selectedPaymentMethod === "bank_transfer") ? (
            /* Bank Transfer Payment + Proof Section */
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-900">
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">Order Created Successfully!</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Please complete your bank transfer and send proof via WhatsApp.
                </p>
              </div>

              {/* Bank Transfer Details with Copy Buttons */}
              <div className="p-4 bg-muted rounded-lg space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Bank Transfer Details
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-background rounded border">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="font-medium text-xs sm:text-sm">Account Name</p>
                      <p className="text-sm sm:text-lg truncate">{shop.bank_account_name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(shop.bank_account_name || '', 'Account Name')}
                    >
                      {copiedField === 'Account Name' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-2 sm:p-3 bg-background rounded border">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="font-medium text-xs sm:text-sm">Bank Name</p>
                      <p className="text-sm sm:text-lg truncate">{shop.bank_name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(shop.bank_name || '', 'Bank Name')}
                    >
                      {copiedField === 'Bank Name' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-2 sm:p-3 bg-background rounded border">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="font-medium text-xs sm:text-sm">Account Number</p>
                      <p className="text-sm sm:text-lg truncate">{shop.bank_account_number}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(shop.bank_account_number || '', 'Account Number')}
                    >
                      {copiedField === 'Account Number' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-2 sm:p-3 bg-background rounded border">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="font-medium text-xs sm:text-sm">Amount to Transfer</p>
                      <p className="text-sm sm:text-lg font-bold">₦{totalAmount.toLocaleString()}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(totalAmount.toString(), 'Amount')}
                    >
                      {copiedField === 'Amount' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Step-by-step instructions */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-900">
                  <h5 className="font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Important Steps
                  </h5>
                  <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-decimal list-inside">
                    <li>Transfer ₦{totalAmount.toLocaleString()} to the account above</li>
                    <li>Take a screenshot of your payment confirmation</li>
                    <li>Click "Send Payment Proof" below to open WhatsApp</li>
                    <li>Attach your screenshot to the WhatsApp message</li>
                  </ol>
                </div>

                {/* Payment Proof Button - Required before completing */}
                {shop.whatsapp_number && (
                  <Button
                    type="button"
                    className={`w-full ${proofSent ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={handleSendProofViaWhatsApp}
                  >
                    {proofSent ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        WhatsApp Opened - Attach Your Screenshot
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send Payment Proof via WhatsApp
                      </>
                    )}
                  </Button>
                )}

                {/* Complete Order Button - Only enabled after proof sent */}
                <Button
                  type="button"
                  variant={proofSent ? "default" : "outline"}
                  className="w-full"
                  onClick={handleCompleteOrder}
                  disabled={!proofSent}
                >
                  {proofSent ? (
                    "Complete Order"
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Send proof first to complete order
                    </>
                  )}
                </Button>

                {!proofSent && (
                  <p className="text-xs text-muted-foreground text-center">
                    You must send payment proof via WhatsApp before completing the order
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
