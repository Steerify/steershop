import { supabase } from '@/integrations/supabase/client';

export interface PayoutRequest {
  shop_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export const payoutService = {
  // Server-authoritative balance (validates caller owns the shop)
  getBalance: async (shopId: string) => {
    const { data: balance, error: balErr } = await supabase
      .rpc('get_shop_balance', { _shop_id: shopId });
    if (balErr) throw balErr;

    // Pull payout breakdown (RLS-scoped) for the UI
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

    const availableBalance = Number(balance ?? 0);
    return {
      totalRevenue: availableBalance + totalWithdrawn + totalPending,
      totalWithdrawn,
      totalPending,
      availableBalance,
    };
  },

  // Idempotent server-side payout request (duplicate guard inside RPC)
  requestPayout: async (data: PayoutRequest) => {
    const MIN_WITHDRAWAL = 5000;
    if (data.amount < MIN_WITHDRAWAL) {
      throw new Error(`Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}`);
    }

    const { data: payoutId, error } = await supabase.rpc('request_payout', {
      _shop_id: data.shop_id,
      _amount: data.amount,
      _bank_name: data.bank_name,
      _account_number: data.account_number,
      _account_name: data.account_name,
    });
    if (error) throw error;
    return { id: payoutId };
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
