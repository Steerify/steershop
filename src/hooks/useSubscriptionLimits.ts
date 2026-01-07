import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeatureUsageResult {
  can_use: boolean;
  blocked_by_plan: boolean;
  current_usage: number;
  max_usage: number;
  is_business: boolean;
  plan_slug: string;
}

interface ProductLimitResult {
  can_create: boolean;
  current_count: number;
  max_allowed: number;
  plan_slug: string;
}

export const useSubscriptionLimits = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkFeatureAccess = useCallback(
    async (featureName: string): Promise<FeatureUsageResult | null> => {
      setIsChecking(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase.rpc("check_feature_usage", {
          _user_id: user.id,
          _feature_name: featureName,
        });

        if (error) {
          console.error("Error checking feature access:", error);
          return null;
        }

        return data as unknown as FeatureUsageResult;
      } catch (error) {
        console.error("Error:", error);
        return null;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  const checkProductLimit = useCallback(async (): Promise<ProductLimitResult | null> => {
    setIsChecking(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc("check_product_limit", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Error checking product limit:", error);
        return null;
      }

      return data as unknown as ProductLimitResult;
    } catch (error) {
      console.error("Error:", error);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const incrementUsage = useCallback(
    async (featureName: string): Promise<number | null> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase.rpc("increment_feature_usage", {
          _user_id: user.id,
          _feature_name: featureName,
        });

        if (error) {
          console.error("Error incrementing usage:", error);
          return null;
        }

        return data as number;
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    },
    []
  );

  return {
    checkFeatureAccess,
    checkProductLimit,
    incrementUsage,
    isChecking,
  };
};
