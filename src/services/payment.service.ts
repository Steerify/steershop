import { supabase } from '@/integrations/supabase/client';
import { PaymentInitialization, PaymentVerification } from '@/types/api';

const paymentService = {
  initializePayment: async (orderId: string) => {
    const { data, error } = await supabase.functions.invoke('paystack-initialize', {
      body: { orderId }
    });

    if (error) {
      console.error('Payment initialization error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data as PaymentInitialization,
      message: 'Payment initialized successfully'
    };
  },

  verifyPayment: async (reference: string) => {
    const { data, error } = await supabase.functions.invoke('paystack-verify', {
      body: { reference }
    });

    if (error) {
      console.error('Payment verification error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data as PaymentVerification,
      message: 'Payment verified successfully'
    };
  },
};

export default paymentService;
