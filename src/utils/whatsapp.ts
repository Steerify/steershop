/**
 * WhatsApp contact utility with deep link and web link fallback
 * Extracted from CheckoutDialog pattern for reusability
 */

export const openWhatsAppContact = (
  phoneNumber: string,
  shopName: string,
  customMessage?: string
): boolean => {
  if (!phoneNumber) {
    console.error("WhatsApp number not provided");
    return false;
  }

  // Clean the phone number - remove all non-digits except leading +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure it has country code (default to Nigeria +234)
  if (!cleaned.startsWith('+')) {
    cleaned = cleaned.startsWith('234') ? `+${cleaned}` : `+234${cleaned.replace(/^0+/, '')}`;
  }

  // Default inquiry message
  const message = customMessage || 
    `👋 Hello ${shopName}!%0A%0A` +
    `I found your shop on SteerSolo and would like to make an inquiry.%0A%0A` +
    `Please let me know more about your products/services.`;

  // Create deep link and web link
  const deepLink = `whatsapp://send?phone=${cleaned.replace('+', '')}&text=${message}`;
  const webLink = `https://api.whatsapp.com/send?phone=${cleaned}&text=${message}`;

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

/**
 * Format a message for product inquiry
 */
export const formatProductInquiryMessage = (
  shopName: string,
  productName: string
): string => {
  return `👋 Hello ${shopName}!%0A%0A` +
    `I'm interested in "${productName}" from your SteerSolo shop.%0A%0A` +
    `Could you please provide more details about availability and pricing?`;
};

/**
 * Open WhatsApp with order details - for checkout flow
 */
export interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  cart: Array<{ product: { name: string; price: number }; quantity: number }>;
  totalAmount: number;
  shopName: string;
  paymentMethod: 'paid' | 'unpaid' | 'proof_required';
  paymentReference?: string;
}

export const openWhatsAppWithOrder = (
  phoneNumber: string,
  orderDetails: OrderDetails
): boolean => {
  if (!phoneNumber) {
    console.error("WhatsApp number not configured");
    return false;
  }

  // Clean the phone number
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = cleaned.startsWith('234') ? `+${cleaned}` : `+234${cleaned.replace(/^0+/, '')}`;
  }

  // Create order summary
  const orderSummary = orderDetails.cart.map(item => 
    `• ${item.product.name} x ${item.quantity} - ₦${(item.product.price * item.quantity).toLocaleString()}`
  ).join('%0A');

  let message = '';

  if (orderDetails.paymentMethod === 'proof_required') {
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
  } else if (orderDetails.paymentMethod === 'unpaid') {
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

  // Create links
  const deepLink = `whatsapp://send?phone=${cleaned.replace('+', '')}&text=${message}`;
  const webLink = `https://api.whatsapp.com/send?phone=${cleaned}&text=${message}`;

  // Detect mobile vs desktop
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    const start = Date.now();
    window.location.href = deepLink;
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.open(webLink, '_blank');
      }
    }, 1500);
  } else {
    window.open(webLink, '_blank');
  }

  return true;
};
