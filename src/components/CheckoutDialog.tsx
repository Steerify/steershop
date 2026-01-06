import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Minus, Plus, ShoppingCart, Trash2, CreditCard, MessageCircle, Copy, Check, Upload, Camera, User } from "lucide-react";
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
    if (typeof window.PaystackPop !== 'undefined') {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
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
    }
  }, [isOpen]);

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
      if (!shop.paystack_public_key?.trim()) {
        throw new Error("Shop Paystack configuration is missing. Please contact the shop owner.");
      }

      if (!customerEmail?.trim()) {
        throw new Error("Email is required for Paystack payment");
      }

      const scriptLoaded = await loadPaystackScript();
      
      if (!scriptLoaded) {
        throw new Error("Failed to load payment processor. Please check your internet connection.");
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (typeof window.PaystackPop === 'undefined') {
        throw new Error("Payment system not ready. Please try again.");
      }

      const paymentReference = `ORDER_${orderId}_${Date.now()}`;
      
      const paymentSuccess = initializePaystackPayment({
        key: shop.paystack_public_key,
        email: customerEmail,
        amount: totalAmount,
        currency: 'NGN',
        ref: paymentReference,
        callback: async (response: any) => {
          try {
            const { error: updateError } = await supabase
              .from("orders")
              .update({
                payment_status: "paid",
                status: "paid_awaiting_delivery",
                payment_reference: response.reference,
                paid_at: new Date().toISOString()
              })
              .eq("id", orderId);

            if (updateError) throw updateError;

            // Record revenue transaction
            await supabase
              .from("revenue_transactions")
              .insert({
                shop_id: shop.id,
                order_id: orderId,
                amount: totalAmount,
                currency: 'NGN',
                payment_reference: response.reference,
                payment_method: 'paystack',
                transaction_type: 'order_payment',
              });

            toast({
              title: "Payment Successful! 🎉",
              description: "Your order has been confirmed and payment received.",
              action: (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openWhatsAppWithOrderDetails(shop.whatsapp_number || '', {
                      orderId,
                      customerName: formData.customer_name,
                      customerEmail: formData.customer_email,
                      customerPhone: formData.customer_phone,
                      deliveryAddress: formData.delivery_address,
                      cart,
                      totalAmount,
                      paymentReference: response.reference,
                      shopName: shop.shop_name,
                      paymentMethod: "pay_before"
                    });
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
              ),
              duration: 10000,
            });

            cart.forEach((item) => onUpdateQuantity(item.product.id, 0));
            resetForm();
            onClose();

          } catch (error: any) {
            console.error("Error updating order after payment:", error);
            toast({
              title: "Payment Verification Failed",
              description: `Payment was successful but we encountered an issue. Contact support with reference: ${response.reference}`,
              variant: "destructive",
            });
          }
        },
        onClose: () => {
          setIsInitializingPayment(false);
          toast({
            title: "Payment Cancelled",
            description: "You can complete the payment later. Your order has been saved.",
          });
        }
      });

      if (!paymentSuccess) {
        throw new Error("Failed to initialize payment gateway. Please try again.");
      }

    } catch (error: any) {
      console.error("Paystack payment initialization error:", error);
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

    setIsProcessing(true);

    try {
      // Use user from context

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
          total_amount: totalAmount,
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

      // Handle payment choice
      if (paymentChoice === "delivery_before") {
        await handleDeliveryBeforeService(orderId);
      } else {
        // Handle payment before service
        if (shop.payment_method === "paystack") {
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
    if (!proofSent && paymentChoice === "pay_before" && shop.payment_method === "bank_transfer") {
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Checkout - {shop.shop_name}
          </DialogTitle>
          <DialogDescription>
            {orderCreated && paymentChoice === "pay_before" && shop.payment_method === "bank_transfer" 
              ? "Make payment and send proof via WhatsApp"
              : isInitializingPayment
              ? "Initializing payment gateway..."
              : "Complete your order"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cart Items */}
          <div>
            <h3 className="font-semibold mb-3">Your Cart</h3>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">₦{item.product.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock_quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => onUpdateQuantity(item.product.id, 0)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="font-semibold w-24 text-right">
                    ₦{(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {!orderCreated ? (
            <form onSubmit={handleCheckout} className="space-y-4">
              {/* Auto-fill indicator for logged-in users */}
              {isUserLoggedIn && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">
                    Logged in - your info has been auto-filled
                  </span>
                </div>
              )}

              {/* Form fields */}
              <div className="space-y-2">
                <Label htmlFor="customer_name">Full Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="John Doe"
                  className={errors.customer_name ? "border-destructive" : ""}
                />
                {errors.customer_name && (
                  <p className="text-sm text-destructive">{errors.customer_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_email">Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="john@example.com"
                  className={errors.customer_email ? "border-destructive" : ""}
                />
                {errors.customer_email && (
                  <p className="text-sm text-destructive">{errors.customer_email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_phone">Phone Number *</Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className={errors.customer_phone ? "border-destructive" : ""}
                />
                {errors.customer_phone && (
                  <p className="text-sm text-destructive">{errors.customer_phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_address">Delivery Address *</Label>
                <Textarea
                  id="delivery_address"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  placeholder="Enter your full delivery address including landmarks"
                  rows={3}
                  className={errors.delivery_address ? "border-destructive" : ""}
                />
                {errors.delivery_address && (
                  <p className="text-sm text-destructive">{errors.delivery_address}</p>
                )}
              </div>

              {/* Payment Choice */}
              <div className="space-y-3">
                <Label>Payment Option *</Label>
                <RadioGroup
                  value={paymentChoice}
                  onValueChange={(value: "pay_before" | "delivery_before") => setPaymentChoice(value)}
                >
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="pay_before" id="pay_before" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="pay_before" className="font-medium cursor-pointer flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Pay Before Service
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {shop.payment_method === "paystack" 
                          ? "Complete payment via Paystack before delivery"
                          : "Transfer to shop's bank account before delivery"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="delivery_before" id="delivery_before" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="delivery_before" className="font-medium cursor-pointer flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Pay on Delivery
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pay when your order arrives. We'll contact you via WhatsApp to confirm.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Show bank details preview for "Pay Before" with bank transfer */}
              {paymentChoice === "pay_before" && shop.payment_method === "bank_transfer" && (
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

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isProcessing || cart.length === 0 || isInitializingPayment} 
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isInitializingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Initializing Payment...
                    </>
                  ) : paymentChoice === "delivery_before" ? (
                    `Place Order & Contact Seller - ₦${totalAmount.toLocaleString()}`
                  ) : (
                    `Place Order - ₦${totalAmount.toLocaleString()}`
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing || isInitializingPayment}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : isInitializingPayment ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Initializing payment gateway...</p>
            </div>
          ) : (
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
                  <div className="flex justify-between items-center p-3 bg-background rounded border">
                    <div>
                      <p className="font-medium text-sm">Account Name</p>
                      <p className="text-lg">{shop.bank_account_name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(shop.bank_account_name || '', 'Account Name')}
                    >
                      {copiedField === 'Account Name' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-background rounded border">
                    <div>
                      <p className="font-medium text-sm">Bank Name</p>
                      <p className="text-lg">{shop.bank_name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(shop.bank_name || '', 'Bank Name')}
                    >
                      {copiedField === 'Bank Name' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-background rounded border">
                    <div>
                      <p className="font-medium text-sm">Account Number</p>
                      <p className="text-lg">{shop.bank_account_number}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(shop.bank_account_number || '', 'Account Number')}
                    >
                      {copiedField === 'Account Number' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-background rounded border">
                    <div>
                      <p className="font-medium text-sm">Amount to Transfer</p>
                      <p className="text-lg font-bold">₦{totalAmount.toLocaleString()}</p>
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
