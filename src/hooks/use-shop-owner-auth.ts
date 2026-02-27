import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateSubscriptionStatus, canAccessShopFeatures } from "@/utils/subscription";
import { UserRole } from "@/types/api";

export const useShopOwnerAuth = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'trial' | 'expired' | 'free'>('trial');
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      checkShopOwnerAuth();
    }
  }, [user, authLoading]);

  const checkShopOwnerAuth = async () => {
    if (!user) {
      navigate("/auth?tab=login");
      return;
    }

    // Check role
    if (user.role !== UserRole.ENTREPRENEUR) {
      navigate("/customer_dashboard");
      return;
    }

    try {
      // Fetch profile from Supabase
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Use basic profile from user
        const basicProfile = {
          id: user.id,
          email: user.email,
          full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          subscription_tier: 'trial',
          trial_ends_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        };
        setProfile(basicProfile);
        setSubscriptionStatus('trial');
        setDaysRemaining(15);
        setCanAccess(true);
      } else {
        setProfile(profileData);
        
        const subscriptionInfo = calculateSubscriptionStatus(profileData);
        setSubscriptionStatus(subscriptionInfo.status);
        setDaysRemaining(subscriptionInfo.daysRemaining);
        setCanAccess(canAccessShopFeatures(profileData));
      }
    } catch (err) {
      console.error('Error in checkShopOwnerAuth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    profile, 
    isLoading, 
    subscriptionStatus, 
    daysRemaining, 
    canAccess 
  };
};
