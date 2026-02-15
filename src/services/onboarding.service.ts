import { supabase } from '@/integrations/supabase/client';

export interface OnboardingData {
  businessType: string;
  customerSource: string;
  biggestStruggle: string;
  paymentMethod: string;
  deliveryMethod?: string;
  perfectFeature?: string;
  setupPreference?: string;
}

const onboardingService = {
  submitOnboarding: async (data: OnboardingData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Store onboarding response
    const { error } = await supabase.from('onboarding_responses').insert({
      user_id: user.id,
      business_type: data.businessType,
      customer_source: data.customerSource,
      biggest_struggle: data.biggestStruggle,
      payment_method: data.paymentMethod,
      delivery_method: data.deliveryMethod || null,
      perfect_feature: data.perfectFeature || null,
      setup_preference: data.setupPreference || null,
    });
    
    if (error) {
      console.error('Onboarding error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: null,
      message: 'Onboarding completed successfully'
    };
  },

  // Store to Supabase for analytics
  storeOnboardingResponse: async (userId: string, data: OnboardingData) => {
    const { error } = await supabase.from('onboarding_responses').insert({
      user_id: userId,
      business_type: data.businessType,
      customer_source: data.customerSource,
      biggest_struggle: data.biggestStruggle,
      payment_method: data.paymentMethod,
      delivery_method: data.deliveryMethod || null,
      perfect_feature: data.perfectFeature || null,
      setup_preference: data.setupPreference || null,
    });
    if (error) throw error;
  },
};

export default onboardingService;
