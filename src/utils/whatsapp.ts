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
