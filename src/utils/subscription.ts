export interface SubscriptionStatus {
  status: 'active' | 'trial' | 'expired' | 'free';
  daysRemaining: number;
}

export const calculateSubscriptionStatus = (profileData: any, productCount?: number): SubscriptionStatus => {
  if (!profileData) {
    return { status: 'expired', daysRemaining: 0 };
  }

  const now = new Date();
  
  // Check if user has active paid subscription
  if (profileData.is_subscribed && profileData.subscription_expires_at) {
    const expiryDate = new Date(profileData.subscription_expires_at);
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { status: 'active', daysRemaining: diffDays };
    }
  }
  
  // Check trial period - use subscription_expires_at for trial users
  if (profileData.subscription_expires_at && !profileData.is_subscribed) {
    const trialExpiry = new Date(profileData.subscription_expires_at);
    const diffTime = trialExpiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { status: 'trial', daysRemaining: diffDays };
    }
  }
  
  // If trial/subscription expired but user has ≤5 products, they're on Free plan
  if (productCount !== undefined && productCount <= 5) {
    return { status: 'free', daysRemaining: 0 };
  }
  
  return { status: 'expired', daysRemaining: 0 };
};

// Helper to check if user can access shop features
export const canAccessShopFeatures = (profileData: any, productCount?: number): boolean => {
  const { status } = calculateSubscriptionStatus(profileData, productCount);
  return status === 'active' || status === 'trial' || status === 'free';
};
