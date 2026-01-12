import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
  max_products: number | null;
  ai_features_enabled: boolean;
  priority_support: boolean;
  is_active: boolean;
  display_order: number;
  paystack_plan_monthly?: string | null;
  paystack_plan_yearly?: string | null;
}

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  requirement_type: string;
  requirement_value: number;
  color: string;
  is_active: boolean;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges?: Badge;
}

const subscriptionService = {
  // Get all active subscription plans
  async getPlans(): Promise<{ success: boolean; data: SubscriptionPlan[] }> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return { success: false, data: [] };
    }

    // Parse features JSON
    const plans = (data || []).map(plan => ({
      ...plan,
      features: typeof plan.features === 'string' 
        ? JSON.parse(plan.features) 
        : (plan.features || []),
    }));

    return { success: true, data: plans };
  },

  // Initialize subscription payment
  async initializePayment(planSlug: string, billingCycle: 'monthly' | 'yearly'): Promise<{
    success: boolean;
    authorization_url?: string;
    reference?: string;
    error?: string;
  }> {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.functions.invoke('paystack-initialize', {
      body: { plan_slug: planSlug, billing_cycle: billingCycle },
    });

    if (error) {
      console.error('Payment initialization error:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return {
      success: true,
      authorization_url: data.authorization_url,
      reference: data.reference,
    };
  },

  // Verify payment after redirect
  async verifyPayment(reference: string): Promise<{
    success: boolean;
    subscription_expires_at?: string;
    error?: string;
  }> {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.functions.invoke('paystack-verify', {
      body: { reference },
    });

    if (error) {
      console.error('Payment verification error:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return {
      success: data.success,
      subscription_expires_at: data.subscription_expires_at,
    };
  },

  // Get all badges
  async getBadges(): Promise<{ success: boolean; data: Badge[] }> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('requirement_value', { ascending: true });

    if (error) {
      console.error('Error fetching badges:', error);
      return { success: false, data: [] };
    }

    return { success: true, data: data || [] };
  },

  // Get user's earned badges
  async getUserBadges(userId: string): Promise<{ success: boolean; data: UserBadge[] }> {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user badges:', error);
      return { success: false, data: [] };
    }

    return { success: true, data: data || [] };
  },
};

export default subscriptionService;
