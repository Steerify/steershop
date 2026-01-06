import { supabase } from '@/integrations/supabase/client';
import { Prize, PrizeClaim } from '@/types/api';

export const rewardService = {
  getPrizes: async () => {
    const { data, error } = await supabase
      .from('rewards_prizes')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Get prizes error:', error);
      return { success: true, data: [] as Prize[], message: 'No prizes found' };
    }

    return { success: true, data: data as Prize[], message: 'Prizes fetched successfully' };
  },

  getClaims: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: [], message: 'Not authenticated' };

    const { data, error } = await supabase
      .from('prize_claims')
      .select('*, prizes:rewards_prizes (*)')
      .eq('user_id', user.id);

    if (error) return { success: true, data: [], message: 'No claims found' };
    return { success: true, data: data as unknown as PrizeClaim[], message: 'Claims fetched' };
  },

  getUserPoints: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: { total_points: 0 }, message: 'Not authenticated' };

    const { data } = await supabase
      .from('rewards_points')
      .select('total_points')
      .eq('user_id', user.id)
      .single();

    return { success: true, data: { total_points: data?.total_points || 0 }, message: 'Points fetched' };
  },

  claimPrize: async (prizeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: null, message: 'Not authenticated' };

    const { data, error } = await supabase.rpc('claim_prize', {
      p_prize_id: prizeId,
      p_user_id: user.id
    });

    if (error) return { success: false, data: null, message: error.message };
    
    const result = data as any;
    return {
      success: result?.success || false,
      data: result,
      message: result?.error || 'Prize claimed successfully'
    };
  },

  getRewards: async () => {
    const { data } = await supabase.from('rewards_prizes').select('*');
    return { success: true, data: (data || []) as Prize[], message: 'Rewards fetched' };
  },

  createPrize: async (data: Omit<Prize, 'id'>) => {
    const { data: prize, error } = await supabase.from('rewards_prizes').insert(data).select().single();
    if (error) throw new Error(error.message);
    return { success: true, data: prize as Prize, message: 'Prize created' };
  },

  updatePrize: async (id: string, data: Partial<Prize>) => {
    const { data: prize, error } = await supabase.from('rewards_prizes').update(data).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { success: true, data: prize as Prize, message: 'Prize updated' };
  },

  deleteReward: async (id: string) => {
    await supabase.from('rewards_prizes').update({ is_active: false }).eq('id', id);
    return { success: true, data: null, message: 'Reward deleted' };
  },
};
