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
      console.log('Invoking Level 1 verification...');
      const { data: response, error } = await supabase.functions.invoke('verify-identity', {
        body: { type: 'level1', ...data },
      });

      if (error) {
        console.error('Supabase function error:', error);
        // Supabase functions.invoke error is an object with a message
        throw new Error(error.message || 'Failed to reach verification service');
      }
      
      if (response && response.success === false) {
          throw new Error(response.error || 'BVN verification failed');
      }

      return response;
    } catch (error: any) {
      console.error('BVN Verification Service Error:', error);
      throw error;
    }
  },

  /**
   * Level 2 Verification (Bank Account)
   * Verifies a user by matching their profile name against a provided bank account.
   */
  verifyLevel2: async (data: { accountNumber: string; bankCode: string }) => {
    try {
      console.log('Invoking Level 2 verification...');
      const { data: response, error } = await supabase.functions.invoke('verify-identity', {
        body: { type: 'level2', ...data },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to reach verification service');
      }

      if (response && response.success === false) {
          throw new Error(response.error || 'Bank account verification failed');
      }

      return response;
    } catch (error: any) {
      console.error('Bank Verification Service Error:', error);
      throw error;
    }
  },

  /**
   * List Nigerian Banks
   */
  getBanks: async () => {
    try {
      const { data: response, error } = await supabase.functions.invoke('paystack-list-banks');
      
      if (error) throw error;
      if (response && response.success === false) throw new Error(response.error);
      
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching banks:', error);
      // Fallback to empty array to not break UI
      return [];
    }
  }
};

export default kycService;
