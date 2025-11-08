declare global {
  interface Window {
    PaystackPop: any;
  }
}

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  callback?: (response: any) => void;
  onClose?: () => void;
}

export const initializePaystackPayment = (config: PaystackConfig) => {
  if (typeof window.PaystackPop === 'undefined') {
    console.error('Paystack script not loaded');
    return false;
  }

  const handler = window.PaystackPop.setup({
    key: config.key,
    email: config.email,
    amount: config.amount * 100, // Convert to kobo
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
};

// Load Paystack script dynamically
export const loadPaystackScript = (): Promise<boolean> => {
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