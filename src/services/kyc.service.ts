import { supabase } from '@/integrations/supabase/client';

/**
 * Service for Paystack Identity Verification
 */
const kycService = {
  /**
   * Level 1 Verification (BVN)
   * Verifies a user's identity using their Bank Verification Number (BVN).
   */
  verifyLevel1: async (data: { bvn: string; firstName: string; lastName: string }) => {
    try {
      const { data: response, error } = await supabase.functions.invoke('verify-identity', {
        body: { type: 'level1', ...data },
      });

      if (error) {
        throw new Error(error.message || 'Failed to reach verification service');
      }

      if (response && response.success === false) {
        throw new Error(response.error || 'BVN verification failed');
      }

      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('BVN Verification Service Error:', error.message);
        throw error;
      }

      console.error('BVN Verification Service Error:', error);
      throw new Error('Unknown BVN verification error');
    }
  },

  /**
   * Level 2 Verification (Bank Account)
   * Verifies a user by matching their profile name against a provided bank account.
   */
  verifyLevel2: async (data: { accountNumber: string; bankCode: string }) => {
    try {
      const { data: response, error } = await supabase.functions.invoke('verify-identity', {
        body: { type: 'level2', ...data },
      });

      if (error) {
        throw new Error(error.message || 'Failed to reach verification service');
      }

      if (response && response.success === false) {
        throw new Error(response.error || 'Bank account verification failed');
      }

      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Bank Verification Service Error:', error.message);
        throw error;
      }

      console.error('Bank Verification Service Error:', error);
      throw new Error('Unknown bank verification error');
    }
  },

  /**
   * List Nigerian Banks
   */
  getBanks: async (): Promise<Array<{ name: string; code: string }>> => {
    try {
      const { data: response, error } =
        await supabase.functions.invoke('paystack-list-banks');

      if (error) {
        throw new Error(error.message || 'Failed to fetch banks');
      }

      if (response && response.success === false) {
        throw new Error(response.error || 'Failed to fetch banks');
      }

      return response?.data ?? [];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching banks:', error.message);
      } else {
        console.error('Error fetching banks:', error);
      }

      // Don’t break the UI because Paystack sneezed
      return [];
    }
  },
};

export default kycService;
