import { supabase } from '@/integrations/supabase/client';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
  is_active: boolean;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: string;
  points_earned: number;
  created_at: string;
  qualified_at: string | null;
  rewarded_at: string | null;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  rewardedReferrals: number;
  totalPointsEarned: number;
}

const generateUniqueCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SS-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const referralService = {
  // Get or create user's referral code
  getReferralCode: async (): Promise<{ success: boolean; data: ReferralCode | null; message: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: null, message: 'Not authenticated' };

    // Check if user already has a code
    const { data: existingCode, error: fetchError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingCode) {
      return { success: true, data: existingCode as ReferralCode, message: 'Code found' };
    }

    // Generate new code
    const newCode = generateUniqueCode();
    const { data: newCodeData, error: insertError } = await supabase
      .from('referral_codes')
      .insert({ user_id: user.id, code: newCode })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating referral code:', insertError);
      return { success: false, data: null, message: insertError.message };
    }

    return { success: true, data: newCodeData as ReferralCode, message: 'Code created' };
  },

  // Validate a referral code
  validateReferralCode: async (code: string): Promise<{ success: boolean; valid: boolean; referrerId?: string; message: string }> => {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('user_id, is_active')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: true, valid: false, message: 'Invalid referral code' };
    }

    return { success: true, valid: true, referrerId: data.user_id, message: 'Valid code' };
  },

  // Apply referral code (create referral relationship)
  applyReferralCode: async (code: string, referredUserId: string): Promise<{ success: boolean; message: string }> => {
    const validation = await referralService.validateReferralCode(code);
    
    if (!validation.valid || !validation.referrerId) {
      return { success: false, message: 'Invalid referral code' };
    }

    // Don't allow self-referral
    if (validation.referrerId === referredUserId) {
      return { success: false, message: 'Cannot use your own referral code' };
    }

    // Check if user was already referred
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', referredUserId)
      .single();

    if (existingReferral) {
      return { success: false, message: 'You have already been referred' };
    }

    // Create referral
    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: validation.referrerId,
        referred_id: referredUserId,
        referral_code: code.toUpperCase(),
        status: 'pending'
      });

    if (error) {
      console.error('Error applying referral:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Referral code applied! You\'ll both earn points after your first purchase.' };
  },

  // Get user's referrals
  getReferrals: async (): Promise<{ success: boolean; data: Referral[]; message: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: [], message: 'Not authenticated' };

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, data: [], message: error.message };
    }

    return { success: true, data: (data || []) as Referral[], message: 'Referrals fetched' };
  },

  // Get referral statistics
  getReferralStats: async (): Promise<{ success: boolean; data: ReferralStats; message: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        success: false, 
        data: { totalReferrals: 0, pendingReferrals: 0, rewardedReferrals: 0, totalPointsEarned: 0 }, 
        message: 'Not authenticated' 
      };
    }

    const { data, error } = await supabase
      .from('referrals')
      .select('status, points_earned')
      .eq('referrer_id', user.id);

    if (error) {
      return { 
        success: false, 
        data: { totalReferrals: 0, pendingReferrals: 0, rewardedReferrals: 0, totalPointsEarned: 0 }, 
        message: error.message 
      };
    }

    const stats: ReferralStats = {
      totalReferrals: data?.length || 0,
      pendingReferrals: data?.filter(r => r.status === 'pending').length || 0,
      rewardedReferrals: data?.filter(r => r.status === 'rewarded').length || 0,
      totalPointsEarned: data?.reduce((sum, r) => sum + (r.points_earned || 0), 0) || 0
    };

    return { success: true, data: stats, message: 'Stats fetched' };
  },

  // Admin: Get all referrals
  getAllReferrals: async (): Promise<{ success: boolean; data: Referral[]; message: string }> => {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, data: [], message: error.message };
    }

    return { success: true, data: (data || []) as Referral[], message: 'All referrals fetched' };
  },

  // Get user's ambassador tiers
  getAmbassadorTiers: async (): Promise<{ success: boolean; data: any[]; message: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: [], message: 'Not authenticated' };

    const { data, error } = await supabase
      .from('ambassador_tiers')
      .select('*')
      .eq('user_id', user.id);

    if (error) return { success: false, data: [], message: error.message };
    return { success: true, data: data || [], message: 'Tiers fetched' };
  },

  // Claim ambassador rewards via edge function
  claimAmbassadorReward: async (): Promise<{ success: boolean; message: string; rewards_granted: string[]; tiers_reached: string[] }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, message: 'Not authenticated', rewards_granted: [], tiers_reached: [] };

    const response = await supabase.functions.invoke('check-ambassador-tier', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });

    if (response.error) {
      return { success: false, message: response.error.message, rewards_granted: [], tiers_reached: [] };
    }

    return {
      success: true,
      message: 'Rewards checked',
      rewards_granted: response.data?.rewards_granted || [],
      tiers_reached: response.data?.tiers_reached || []
    };
  },

  // Get leaderboard (top referrers)
  getLeaderboard: async (): Promise<{ success: boolean; data: any[]; message: string }> => {
    const { data, error } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('status', 'rewarded');

    if (error) return { success: false, data: [], message: error.message };

    // Count per referrer
    const counts: Record<string, number> = {};
    (data || []).forEach((r: any) => {
      counts[r.referrer_id] = (counts[r.referrer_id] || 0) + 1;
    });

    // Sort and get top 5
    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Get anonymized names
    const leaderboard = await Promise.all(
      sorted.map(async ([userId, count], index) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single();

        const name = profile?.full_name || profile?.email?.split('@')[0] || 'User';
        const anonymized = name.length > 2
          ? name[0] + '***' + name[name.length - 1]
          : '***';

        return { rank: index + 1, name: anonymized, count };
      })
    );

    return { success: true, data: leaderboard, message: 'Leaderboard fetched' };
  }
};
