import { supabase } from '@/integrations/supabase/client';
import { RevenueTransaction } from '@/types/api';

export const revenueService = {
  createTransaction: async (data: RevenueTransaction) => {
    const { data: transaction, error } = await supabase
      .from('revenue_transactions')
      .insert({
        shop_id: data.shop_id,
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency,
        payment_reference: data.payment_reference,
        payment_method: data.payment_method,
        transaction_type: data.transaction_type,
      })
      .select()
      .single();

    if (error) {
      console.error('Create transaction error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: transaction as unknown as RevenueTransaction,
      message: 'Transaction created successfully'
    };
  }
};
