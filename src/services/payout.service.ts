import { supabase } from '@/integrations/supabase/client';

export interface PayoutRequest {
  shop_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export const payoutService = {
  getBalance: async (shopId: string) => {
    // Total net revenue from paid Paystack orders (platform holds these funds)
    const { data: revenue, error: revError } = await supabase
      .from('revenue_transactions')
      .select('amount')
      .eq('shop_id', shopId)
      .eq('payment_method', 'paystack');

    if (revError) throw revError;

    const totalRevenue = (revenue || []).reduce((sum, r) => sum + Number(r.amount), 0);

    // Total already withdrawn
    const { data: payouts, error: payError } = await supabase
      .from('shop_payouts')
      .select('amount, status')
      .eq('shop_id', shopId)
      .in('status', ['pending', 'processing', 'completed']);

    if (payError) throw payError;

    const totalWithdrawn = (payouts || [])
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalPending = (payouts || [])
      .filter(p => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalRevenue,
      totalWithdrawn,
      totalPending,
      availableBalance: totalRevenue - totalWithdrawn - totalPending,
    };
  },

  requestPayout: async (data: PayoutRequest) => {
    const MIN_WITHDRAWAL = 5000;
    if (data.amount < MIN_WITHDRAWAL) {
      throw new Error(`Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}`);
    }

    const { data: payout, error } = await supabase
      .from('shop_payouts')
      .insert({
        shop_id: data.shop_id,
        amount: data.amount,
        bank_name: data.bank_name,
        account_number: data.account_number,
        account_name: data.account_name,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return payout;
  },

  getPayoutHistory: async (shopId: string) => {
    const { data, error } = await supabase
      .from('shop_payouts')
      .select('*')
      .eq('shop_id', shopId)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Admin methods
  getAllPendingPayouts: async () => {
    const { data, error } = await supabase
      .from('shop_payouts')
      .select('*, shops:shop_id(shop_name)')
      .in('status', ['pending', 'processing'])
      .order('requested_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  updatePayoutStatus: async (payoutId: string, status: string, adminNotes?: string) => {
    const updateData: Record<string, any> = { status };
    if (status === 'completed' || status === 'failed') {
      updateData.processed_at = new Date().toISOString();
    }
    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('shop_payouts')
      .update(updateData)
      .eq('id', payoutId);

    if (error) throw error;
    return { success: true };
  },
};
