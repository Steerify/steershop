import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface MarketingAccess {
  canAccess: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  isBusinessUser: boolean;
  reason: string;
  isLoading: boolean;
}

export const useMarketingAccess = (): MarketingAccess => {
  const { user } = useAuth();
  const [access, setAccess] = useState<MarketingAccess>({
    canAccess: false,
    isTrialActive: false,
    trialDaysRemaining: 0,
    isBusinessUser: false,
    reason: "Loading...",
    isLoading: true,
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setAccess({
          canAccess: false,
          isTrialActive: false,
          trialDaysRemaining: 0,
          isBusinessUser: false,
          reason: "Please log in to access marketing tools",
          isLoading: false,
        });
        return;
      }

      try {
        // Get user profile with subscription info
        const { data: profile } = await supabase
          .from("profiles")
          .select(`
            *,
            subscription_plans:subscription_plan_id (
              slug,
              name
            )
          `)
          .eq("id", user.id)
          .single();

        if (!profile) {
          setAccess({
            canAccess: false,
            isTrialActive: false,
            trialDaysRemaining: 0,
            isBusinessUser: false,
            reason: "Profile not found",
            isLoading: false,
          });
          return;
        }

        const now = new Date();
        const expiresAt = profile.subscription_expires_at
          ? new Date(profile.subscription_expires_at)
          : null;

        const planSlug = (profile.subscription_plans as any)?.slug || "basic";
        const isBusinessUser = planSlug === "business";
        const isPaidUser = profile.is_subscribed && expiresAt && expiresAt > now;
        const isInTrial = !profile.is_subscribed && expiresAt && expiresAt > now;

        // Calculate trial days remaining
        let trialDaysRemaining = 0;
        if (isInTrial && expiresAt) {
          trialDaysRemaining = Math.ceil(
            (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        // Business plan users get full access
        if (isBusinessUser && (isPaidUser || isInTrial)) {
          setAccess({
            canAccess: true,
            isTrialActive: isInTrial,
            trialDaysRemaining,
            isBusinessUser: true,
            reason: "Full access - Business Plan",
            isLoading: false,
          });
          return;
        }

        // Trial users with any plan get temporary Business-level access
        if (isInTrial && trialDaysRemaining > 0) {
          setAccess({
            canAccess: true,
            isTrialActive: true,
            trialDaysRemaining,
            isBusinessUser: false,
            reason: `Trial access - ${trialDaysRemaining} days remaining`,
            isLoading: false,
          });
          return;
        }

        // Non-business paid users don't have access
        if (isPaidUser && !isBusinessUser) {
          setAccess({
            canAccess: false,
            isTrialActive: false,
            trialDaysRemaining: 0,
            isBusinessUser: false,
            reason: "Upgrade to Business plan to access marketing tools",
            isLoading: false,
          });
          return;
        }

        // Expired subscription
        setAccess({
          canAccess: false,
          isTrialActive: false,
          trialDaysRemaining: 0,
          isBusinessUser: false,
          reason: "Subscribe to Business plan to access marketing tools",
          isLoading: false,
        });
      } catch (error) {
        console.error("Error checking marketing access:", error);
        setAccess({
          canAccess: false,
          isTrialActive: false,
          trialDaysRemaining: 0,
          isBusinessUser: false,
          reason: "Error checking access",
          isLoading: false,
        });
      }
    };

    checkAccess();
  }, [user]);

  return access;
};
