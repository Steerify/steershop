import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

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
};

export default onboardingService;
