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
        throw error;
      }
      
      // Check if the business logic failed but returned 200 (if structured that way)
      // My edge function returns 400 on error, so 'error' variable should catch it if invoke fails.
      // But let's be safe and check response.error as well if it parsed JSON
      if (response && response.error) {
          throw new Error(response.error);
      }

      return response;
    } catch (error: any) {
      console.error('BVN Verification Error:', error);
      // Construct a meaningful error message
      let errorMessage = 'BVN verification failed';
       try {
          if (error.context && typeof error.context.json === 'function') {
            const errorBody = await error.context.json();
            errorMessage = errorBody.error || errorBody.message || errorMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }
        } catch (e) {
             // connection errors etc
             errorMessage = error.message || errorMessage;
        }
      throw new Error(errorMessage);
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
        throw error;
      }

      if (response && response.error) {
          throw new Error(response.error);
      }

      return response;
    } catch (error: any) {
      console.error('Bank Verification Error:', error);
       let errorMessage = 'Bank account verification failed';
       try {
          if (error.context && typeof error.context.json === 'function') {
            const errorBody = await error.context.json();
            errorMessage = errorBody.error || errorBody.message || errorMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }
        } catch (e) {
             errorMessage = error.message || errorMessage;
        }
      throw new Error(errorMessage);
    }
  },
};

export default kycService;
