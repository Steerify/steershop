import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Minus, Plus, ShoppingCart, Trash2, CreditCard, MessageCircle, Copy, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";

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

declare global {
  interface Window {
    PaystackPop: any;
  }
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
      console.log('Paystack script already loaded');
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => {
      console.log('Paystack script loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Paystack script');
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
      amount: config.amount * 100, // Convert to kobo
      currency: config.currency || 'NGN',
      ref: config.ref || `PS_${Math.floor((Math.random() * 1000000000) + 1)}`,
      callback: (response: any) => {
        console.log('Paystack callback:', response);
        if (config.callback) {
          config.callback(response);
        }
      },
      onClose: () => {
        console.log('Paystack payment closed');
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

// Function to open WhatsApp with detailed order information
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
  }
) => {
  if (!shopWhatsappNumber) {
    console.error("WhatsApp number not configured");
    return false;
  }

  // Clean the phone number
  const cleaned = shopWhatsappNumber.replace(/[^\d+]/g, '');
  const phoneNumber = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;

  // Create detailed order summary
  const orderSummary = orderDetails.cart.map(item => 
    `• ${item.product.name} x ${item.quantity} - ₦${(item.product.price * item.quantity).toLocaleString()}`
  ).join('%0A');

  let baseMessage = '';
  let paymentSection = '';

  if (orderDetails.paymentMethod === 'delivery_before') {
    baseMessage = `🛒 *ORDER REQUEST - DELIVERY/SERVICE BEFORE PAYMENT* 🛒%0A%0AHello ${orderDetails.shopName},%0A%0AI would like to receive the product/service FIRST and pay afterwards. Please review and confirm if you can fulfill this order:`;
    paymentSection = `*💰 PAYMENT METHOD:*%0ADelivery/Service Before Payment%0A*📋 PAYMENT STATUS:*%0A⚠️ UNPAID - Customer will pay after receiving order%0A`;
  } else {
    baseMessage = `🎉 *PAYMENT SUCCESSFUL* 🎉%0A%0AHello ${orderDetails.shopName},%0A%0AI have successfully completed my order and payment. Here are the complete details:`;
    paymentSection = `*💰 PAYMENT DETAILS:*%0ATotal Amount: ₦${orderDetails.totalAmount.toLocaleString()}%0APayment Reference: ${orderDetails.paymentReference || 'N/A'}%0A`;
  }

  const fullMessage = `${baseMessage}%0A%0A` +
    `*📦 ORDER SUMMARY:*%0A` +
    `${orderSummary}%0A%0A` +
    `*💰 TOTAL AMOUNT:*%0A₦${orderDetails.totalAmount.toLocaleString()}%0A%0A` +
    `${paymentSection}` +
    `Order ID: ${orderDetails.orderId}%0A%0A` +
    `*👤 CUSTOMER DETAILS:*%0A` +
    `Name: ${orderDetails.customerName}%0A` +
    `Email: ${orderDetails.customerEmail}%0A` +
    `Phone: ${orderDetails.customerPhone}%0A` +
    `Delivery Address: ${orderDetails.deliveryAddress}%0A%0A` +
    `Please confirm if you can fulfill this order and provide delivery timeline.`;

  // Create both deep link and web link
  const deepLink = `whatsapp://send?phone=${phoneNumber.replace('+', '')}&text=${fullMessage}`;
  const webLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${fullMessage}`;

  // Try to open the deep link with fallback
  const fallbackTimer = setTimeout(() => {
    window.open(webLink, '_blank');
  }, 1000);

  const link = document.createElement('a');
  link.href = deepLink;
  link.target = '_blank';
  
  link.addEventListener('click', () => {
    clearTimeout(fallbackTimer);
  });
  
  setTimeout(() => {
    clearTimeout(fallbackTimer);
  }, 500);
  
  link.click();
  return true;
};

const CheckoutDialog = ({ isOpen, onClose, cart, shop, onUpdateQuantity, totalAmount }: CheckoutDialogProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<"pay_before" | "delivery_before">("delivery_before");
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);

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
    console.log('Starting Paystack payment process for order:', orderId);
    
    // Don't close dialog yet - wait for payment initialization
    setIsInitializingPayment(true);

    try {
      // Validate Paystack configuration
      if (!shop.paystack_public_key?.trim()) {
        throw new Error("Shop Paystack configuration is missing. Please contact the shop owner.");
      }

      if (!customerEmail?.trim()) {
        throw new Error("Email is required for Paystack payment");
      }

      // Load Paystack script
      console.log('Loading Paystack script...');
      const scriptLoaded = await loadPaystackScript();
      
      if (!scriptLoaded) {
        throw new Error("Failed to load payment processor. Please check your internet connection and try again.");
      }

      // Wait for script to fully initialize
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (typeof window.PaystackPop === 'undefined') {
        throw new Error("Payment system not ready. Please try again.");
      }

      console.log('Initializing Paystack payment...');
      
      // Generate a unique reference
      const paymentReference = `ORDER_${orderId}_${Date.now()}`;
      
      // Initialize Paystack payment
      const paymentSuccess = initializePaystackPayment({
        key: shop.paystack_public_key,
        email: customerEmail,
        amount: totalAmount,
        currency: 'NGN',
        ref: paymentReference,
        callback: async (response: any) => {
          console.log('Paystack payment successful callback:', response);
          
          try {
            // Update order status
            const { error: updateError } = await supabase
              .from("orders")
              .update({
                payment_status: "paid",
                status: "paid_awaiting_delivery",
                payment_reference: response.reference,
                paid_at: new Date().toISOString()
              })
              .eq("id", orderId);

            if (updateError) {
              console.error('Supabase update error:', updateError);
              throw updateError;
            }

            // Record revenue transaction
            const { error: revenueError } = await supabase
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

            if (revenueError) {
              console.error('Revenue recording error:', revenueError);
              // Don't throw - order is still successful even if revenue tracking fails
            }

            console.log('Order successfully updated after payment');

            // Show success message
            toast({
              title: "Payment Successful! 🎉",
              description: "Your order has been confirmed and payment received. Opening WhatsApp...",
              duration: 5000,
            });

            // Automatically open WhatsApp with order details
            if (shop.whatsapp_number) {
              setTimeout(() => {
                openWhatsAppWithOrderDetails(shop.whatsapp_number, {
                  orderId: orderId,
                  customerName: formData.customer_name,
                  customerEmail: formData.customer_email,
                  customerPhone: formData.customer_phone,
                  deliveryAddress: formData.delivery_address,
                  cart: cart,
                  totalAmount: totalAmount,
                  paymentReference: response.reference,
                  shopName: shop.shop_name,
                  paymentMethod: "pay_before"
                });
              }, 2000); // 2 second delay to show toast first
            }

            // Clear cart and reset form
            cart.forEach((item) => onUpdateQuantity(item.product.id, 0));
            setFormData({
              customer_name: "",
              customer_email: "",
              customer_phone: "",
              delivery_address: "",
            });
            setOrderCreated(false);
            setCurrentOrderId(null);
            
            // Close dialog only after successful payment processing
            onClose();

          } catch (error: any) {
            console.error("Error updating order after payment:", error);
            
            // Show detailed error message
            toast({
              title: "Payment Verification Failed",
              description: `Payment was successful but we encountered an issue updating your order. Please contact support with reference: ${response.reference}`,
              variant: "destructive",
              action: shop.whatsapp_number ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const message = encodeURIComponent(
                      `Payment Verification Issue%0A%0A` +
                      `Order ID: ${orderId}%0A` +
                      `Payment Reference: ${response.reference}%0A` +
                      `Amount: ₦${totalAmount.toLocaleString()}%0A` +
                      `Issue: Payment successful but order update failed`
                    );
                    const whatsappUrl = `https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}?text=${message}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Get Help
                </Button>
              ) : undefined,
            });
          }
        },
        onClose: () => {
          console.log('Paystack payment window closed');
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
      // Update order status to indicate it's awaiting shop approval
      const { error: updateError } = await supabase
        .from("orders")
        .update({ 
          status: "awaiting_approval",
          payment_status: "unpaid"
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Open WhatsApp with negotiation message
      const whatsappOpened = openWhatsAppWithOrderDetails(shop.whatsapp_number || '', {
        orderId: orderId,
        customerName: formData.customer_name,
        customerEmail: formData.customer_email,
        customerPhone: formData.customer_phone,
        deliveryAddress: formData.delivery_address,
        cart: cart,
        totalAmount: totalAmount,
        shopName: shop.shop_name,
        paymentMethod: "delivery_before"
      });

      if (whatsappOpened) {
        toast({
          title: "Order Request Sent! 📦",
          description: "We've opened WhatsApp for you to discuss the order. The seller will review and confirm your request.",
          duration: 6000,
        });
      } else {
        toast({
          title: "Order Request Submitted!",
          description: "Your order request has been sent. The seller will review and contact you to confirm.",
          variant: "default",
        });
      }

      // Clear cart and close dialog
      cart.forEach((item) => onUpdateQuantity(item.product.id, 0));
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        delivery_address: "",
      });
      setOrderCreated(false);
      setCurrentOrderId(null);
      onClose();

    } catch (error: any) {
      console.error("Error in delivery before service:", error);
      toast({
        title: "Order Request Submitted!",
        description: "Your order request has been saved. The seller will contact you to confirm.",
        variant: "default",
      });
    }
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
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // Generate order ID client-side to avoid SELECT RLS issues
      const orderId = crypto.randomUUID();

      // Create order without .select() to avoid RLS SELECT restriction
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

      // Create order items
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

      console.log('Order created successfully:', orderId);

      // Handle payment choice
      if (paymentChoice === "delivery_before") {
        await handleDeliveryBeforeService(orderId);
      } else {
        // Handle payment before service
        if (shop.payment_method === "paystack") {
          console.log('Initiating Paystack payment...');
          await handlePaystackPayment(orderId, formData.customer_email);
        } else {
          // Show bank transfer details with WhatsApp option
          toast({
            title: "Order Placed Successfully!",
            description: "Please complete your bank transfer and contact the seller.",
            action: shop.whatsapp_number ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const message = encodeURIComponent(
                    `Hello! I've placed an order and need bank transfer details.%0A%0A` +
                    `Order ID: ${orderId}%0A` +
                    `Amount: ₦${totalAmount.toLocaleString()}%0A` +
                    `Name: ${formData.customer_name}`
                  );
                  const whatsappUrl = `https://wa.me/${shop.whatsapp_number.replace(/[^0-9]/g, '')}?text=${message}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Get Bank Details
              </Button>
            ) : undefined,
            duration: 8000,
          });
        }
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

  const handleCompleteOrder = () => {
    // Clear cart and close dialog
    cart.forEach((item) => onUpdateQuantity(item.product.id, 0));
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      delivery_address: "",
    });
    setOrderCreated(false);
    setCurrentOrderId(null);
    onClose();
    
    toast({
      title: "Order Completed",
      description: "Thank you for your order!",
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
              ? "Please complete your bank transfer using the details below"
              : isInitializingPayment
              ? "Initializing payment gateway..."
              : "Complete your order and the shop owner will contact you"}
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

              {/* Show payment details for "Pay Before" */}
              {paymentChoice === "pay_before" && shop.payment_method === "bank_transfer" && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-semibold">Bank Transfer Details</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Account Name:</span> {shop.bank_account_name}</p>
                    <p><span className="font-medium">Bank:</span> {shop.bank_name}</p>
                    <p><span className="font-medium">Account Number:</span> {shop.bank_account_number}</p>
                    <p className="text-muted-foreground text-xs mt-2">
                      Please transfer ₦{totalAmount.toLocaleString()} and the shop owner will confirm your payment.
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
            /* Bank Transfer Completion Section */
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Order Created Successfully!</h4>
                <p className="text-sm text-green-700">
                  Your order has been placed. Please complete your bank transfer using the details below.
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

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> After transferring ₦{totalAmount.toLocaleString()}, 
                    please send proof of payment to the shop owner via WhatsApp. Your order will be 
                    confirmed once payment is verified.
                  </p>
                </div>

                {shop.whatsapp_number && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      openWhatsAppWithOrderDetails(shop.whatsapp_number, {
                        orderId: currentOrderId!,
                        customerName: formData.customer_name,
                        customerEmail: formData.customer_email,
                        customerPhone: formData.customer_phone,
                        deliveryAddress: formData.delivery_address,
                        cart: cart,
                        totalAmount: totalAmount,
                        shopName: shop.shop_name,
                        paymentMethod: "pay_before"
                      });
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Proof via WhatsApp
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleCompleteOrder}
                >
                  I've Completed the Transfer
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;