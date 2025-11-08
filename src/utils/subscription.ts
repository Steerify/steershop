export interface SubscriptionStatus {
  status: 'active' | 'trial' | 'expired';
  daysRemaining: number;
}

export const calculateSubscriptionStatus = (profileData: any): SubscriptionStatus => {
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
  
  return { status: 'expired', daysRemaining: 0 };
};

// Helper to check if user can access shop features
export const canAccessShopFeatures = (profileData: any): boolean => {
  const { status } = calculateSubscriptionStatus(profileData);
  return status === 'active' || status === 'trial';
};