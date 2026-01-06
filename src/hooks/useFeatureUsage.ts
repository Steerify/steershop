import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeatureUsageResult {
  can_use: boolean;
  current_usage: number;
  max_usage: number;
  is_business: boolean;
  plan_slug: string;
}

export const useFeatureUsage = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkFeatureUsage = useCallback(async (featureName: string): Promise<FeatureUsageResult | null> => {
    setIsChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .rpc("check_feature_usage", {
          _user_id: user.id,
          _feature_name: featureName,
        });

      if (error) {
        console.error("Error checking feature usage:", error);
        return null;
      }

      return data as unknown as FeatureUsageResult;
    } catch (error) {
      console.error("Error:", error);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const incrementUsage = useCallback(async (featureName: string): Promise<number | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .rpc("increment_feature_usage", {
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
  }, []);

  return {
    checkFeatureUsage,
    incrementUsage,
    isChecking,
  };
};
