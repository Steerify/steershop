import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { calculateSubscriptionStatus, canAccessShopFeatures } from "@/utils/subscription";

export const useShopOwnerAuth = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'trial' | 'expired'>('trial');
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    checkShopOwnerAuth();
  }, []);

  const checkShopOwnerAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Check role from user_roles table (authoritative source)
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role !== "shop_owner") {
        navigate("/customer/dashboard");
        return;
      }

      setProfile(profileData);
      
      const subscriptionInfo = calculateSubscriptionStatus(profileData);
      setSubscriptionStatus(subscriptionInfo.status);
      setDaysRemaining(subscriptionInfo.daysRemaining);
      setCanAccess(canAccessShopFeatures(profileData));
      
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/auth/login");
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