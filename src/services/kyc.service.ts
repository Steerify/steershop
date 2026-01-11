import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

const BASE_URL = 'https://steershop-kyc.onrender.com/api/kyc';

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
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(`${BASE_URL}/level1`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'BVN verification failed');
      }
      throw error;
    }
  },

  /**
   * Level 2 Verification (Bank Account)
   * Verifies a user by matching their profile name against a provided bank account.
   */
  verifyLevel2: async (data: { accountNumber: string; bankCode: string }) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(`${BASE_URL}/level2`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Bank account verification failed');
      }
      throw error;
    }
  },
};

export default kycService;
