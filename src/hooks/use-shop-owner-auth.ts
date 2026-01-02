import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { calculateSubscriptionStatus, canAccessShopFeatures } from "@/utils/subscription";

export const useShopOwnerAuth = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'trial' | 'expired'>('trial');
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      checkShopOwnerAuth();
    }
  }, [user, authLoading]);

  const checkShopOwnerAuth = async () => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    // In a mock world, we assume the user has a profile and the correct role
    // Since we hardcoded the user to be a shop_owner in AuthContext
    const mockProfileData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      subscription_tier: 'trial',
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (user.role !== "shop_owner") {
      navigate("/customer/dashboard");
      return;
    }

    setProfile(mockProfileData);
    
    const subscriptionInfo = calculateSubscriptionStatus(mockProfileData);
    setSubscriptionStatus(subscriptionInfo.status);
    setDaysRemaining(subscriptionInfo.daysRemaining);
    setCanAccess(canAccessShopFeatures(mockProfileData));
    
    setIsLoading(false);
  };

  return { 
    profile, 
    isLoading, 
    subscriptionStatus, 
    daysRemaining, 
    canAccess 
  };
};