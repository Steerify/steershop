import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingData {
  businessType: string;
  customerSource: string;
  biggestStruggle: string;
  paymentMethod: string;
  perfectFeature?: string;
}

const onboardingService = {
  submitOnboarding: async (data: OnboardingData) => {
    try {
      const response = await api.post<ApiResponse<any>>('/onboarding', data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Store to Supabase for analytics
  storeOnboardingResponse: async (userId: string, data: OnboardingData) => {
    const { error } = await supabase.from('onboarding_responses').insert({
      user_id: userId,
      business_type: data.businessType,
      customer_source: data.customerSource,
      biggest_struggle: data.biggestStruggle,
      payment_method: data.paymentMethod,
      perfect_feature: data.perfectFeature || null,
    });
    if (error) throw error;
  },
};

export default onboardingService;
