import { supabase } from '@/integrations/supabase/client';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
  is_active: boolean;
}

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'reversed';

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
  commission_rate: number;
  source_payment_reference: string | null;
  source_subscription_id: string | null;
  commission_amount: number | null;
  commission_currency: string | null;
  commission_status: CommissionStatus;
  commission_created_at: string | null;
}

export interface AmbassadorProfile {
  id: string;
  user_id: string;
  legal_name: string;
  phone: string | null;
  payout_bank_name: string | null;
  payout_bank_code: string | null;
  payout_account_number: string | null;
  payout_account_name: string | null;
  tax_id: string | null;
  compliance_notes: string | null;
  enrollment_status: 'active' | 'suspended';
  enrolled_at: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  approvedReferrals: number;
  paidReferrals: number;
  reversedReferrals: number;
  pendingCommission: number;
  paidCommission: number;
  totalCommission: number;
}

const EMPTY_STATS: ReferralStats = {
  totalReferrals: 0,
  pendingReferrals: 0,
  approvedReferrals: 0,
  paidReferrals: 0,
  reversedReferrals: 0,
  pendingCommission: 0,
  paidCommission: 0,
  totalCommission: 0,
};

const generateUniqueCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SS-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const toNumber = (value: unknown): number => (typeof value === 'number' ? value : 0);

export const referralService = {
  getReferralCode: async (): Promise<{ success: boolean; data: ReferralCode | null; message: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: null, message: 'Not authenticated' };

    const { data: existingCode } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingCode) {
      return { success: true, data: existingCode as ReferralCode, message: 'Code found' };
    }

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

  applyReferralCode: async (code: string, referredUserId: string): Promise<{ success: boolean; message: string }> => {
    const validation = await referralService.validateReferralCode(code);

    if (!validation.valid || !validation.referrerId) {
      return { success: false, message: 'Invalid referral code' };
    }

    if (validation.referrerId === referredUserId) {
      return { success: false, message: 'Cannot use your own referral code' };
    }

    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', referredUserId)
      .single();

    if (existingReferral) {
      return { success: false, message: 'You have already been referred' };
    }

    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: validation.referrerId,
        referred_id: referredUserId,
        referral_code: code.toUpperCase(),
        status: 'pending',
      });

    if (error) {
      console.error('Error applying referral:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Referral code applied! Commission is tracked after successful subscription payment.' };
  },

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

  getReferralStats: async (): Promise<{ success: boolean; data: ReferralStats; message: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, data: EMPTY_STATS, message: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('referrals')
      .select('commission_status, commission_amount')
      .eq('referrer_id', user.id);

    if (error) {
      return { success: false, data: EMPTY_STATS, message: error.message };
    }

    const pendingCommission = (data || [])
      .filter((r) => r.commission_status === 'pending' || r.commission_status === 'approved')
      .reduce((sum, r) => sum + toNumber(r.commission_amount), 0);

    const paidCommission = (data || [])
      .filter((r) => r.commission_status === 'paid')
      .reduce((sum, r) => sum + toNumber(r.commission_amount), 0);

    const stats: ReferralStats = {
      totalReferrals: data?.length || 0,
      pendingReferrals: data?.filter((r) => r.commission_status === 'pending').length || 0,
      approvedReferrals: data?.filter((r) => r.commission_status === 'approved').length || 0,
      paidReferrals: data?.filter((r) => r.commission_status === 'paid').length || 0,
      reversedReferrals: data?.filter((r) => r.commission_status === 'reversed').length || 0,
      pendingCommission,
      paidCommission,
      totalCommission: pendingCommission + paidCommission,
    };

    return { success: true, data: stats, message: 'Stats fetched' };
  },

  getAllReferrals: async (): Promise<{ success: boolean; data: Referral[]; message: string }> => {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('commission_created_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, data: [], message: error.message };
    }

    return { success: true, data: (data || []) as Referral[], message: 'All referrals fetched' };
  },

  getAmbassadorProfile: async (): Promise<{ success: boolean; data: AmbassadorProfile | null; message: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: null, message: 'Not authenticated' };

    const { data, error } = await supabase
      .from('ambassador_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return { success: false, data: null, message: error.message };

    return { success: true, data: (data || null) as AmbassadorProfile | null, message: 'Profile fetched' };
  },

  upsertAmbassadorProfile: async (payload: {
    legal_name: string;
    phone?: string | null;
    payout_bank_name?: string | null;
    payout_bank_code?: string | null;
    payout_account_number?: string | null;
    payout_account_name?: string | null;
    tax_id?: string | null;
    compliance_notes?: string | null;
  }): Promise<{ success: boolean; message: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Not authenticated' };

    const { error } = await supabase.from('ambassador_profiles').upsert({
      user_id: user.id,
      legal_name: payload.legal_name,
      phone: payload.phone || null,
      payout_bank_name: payload.payout_bank_name || null,
      payout_bank_code: payload.payout_bank_code || null,
      payout_account_number: payload.payout_account_number || null,
      payout_account_name: payload.payout_account_name || null,
      tax_id: payload.tax_id || null,
      compliance_notes: payload.compliance_notes || null,
    }, { onConflict: 'user_id' });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Enrollment details saved' };
  },

  getLeaderboard: async (): Promise<{ success: boolean; data: any[]; message: string }> => {
    const { data, error } = await supabase
      .from('referrals')
      .select('referrer_id, commission_amount')
      .in('commission_status', ['pending', 'approved', 'paid']);

    if (error) return { success: false, data: [], message: error.message };

    const counts: Record<string, { referrals: number; commission: number }> = {};
    (data || []).forEach((r: any) => {
      counts[r.referrer_id] = counts[r.referrer_id] || { referrals: 0, commission: 0 };
      counts[r.referrer_id].referrals += 1;
      counts[r.referrer_id].commission += toNumber(r.commission_amount);
    });

    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b.commission - a.commission)
      .slice(0, 5);

    const leaderboard = await Promise.all(
      sorted.map(async ([userId, metrics], index) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single();

        const name = profile?.full_name || profile?.email?.split('@')[0] || 'User';
        const anonymized = name.length > 2
          ? name[0] + '***' + name[name.length - 1]
          : '***';

        return {
          rank: index + 1,
          name: anonymized,
          count: metrics.referrals,
          commission: metrics.commission,
        };
      })
    );

    return { success: true, data: leaderboard, message: 'Leaderboard fetched' };
  },
};
