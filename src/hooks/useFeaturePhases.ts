import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeaturePhase {
  key: string;
  enabled: boolean;
  label: string;
  description: string;
  features: string[];
}

const PHASE_DEFINITIONS: Record<string, { description: string; features: string[] }> = {
  feature_phase_1: {
    description: "Core store creation, product upload, store link, WhatsApp order button",
    features: ["Store creation", "Product upload", "Store link sharing", "WhatsApp order button"],
  },
  feature_phase_2: {
    description: "Marketplace browsing, categories, featured vendors, search & filters",
    features: ["Marketplace browsing", "Category filters", "Featured vendors", "Search & discovery", "Trending stores"],
  },
  feature_phase_3: {
    description: "Verified vendors, reviews/ratings, Paystack payment integration",
    features: ["Verified vendor badges", "Product reviews & ratings", "Paystack payments", "Trust scores"],
  },
  feature_phase_4: {
    description: "Vendor analytics, paid promotions, recommendation engine",
    features: ["Vendor analytics dashboard", "Paid promotions", "Product recommendations", "Advanced insights"],
  },
};

export function useFeaturePhases() {
  const queryClient = useQueryClient();

  const { data: phases = [], isLoading } = useQuery({
    queryKey: ["feature-phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .like("key", "feature_phase_%");

      if (error) throw error;

      return (data || []).map((row) => {
        const val = row.value as { enabled?: boolean; label?: string } | null;
        const def = PHASE_DEFINITIONS[row.key] || { description: "", features: [] };
        return {
          key: row.key,
          enabled: val?.enabled ?? false,
          label: val?.label ?? row.key,
          description: def.description,
          features: def.features,
        } as FeaturePhase;
      }).sort((a, b) => a.key.localeCompare(b.key));
    },
    staleTime: 2 * 60 * 1000,
  });

  const togglePhase = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const phase = phases.find((p) => p.key === key);
      const { error } = await supabase
        .from("platform_settings")
        .update({
          value: { enabled, label: phase?.label || key } as any,
          updated_at: new Date().toISOString(),
        })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-phases"] });
    },
  });

  const isPhaseEnabled = (phaseNumber: number) => {
    const phase = phases.find((p) => p.key === `feature_phase_${phaseNumber}`);
    return phase?.enabled ?? false;
  };

  return { phases, isLoading, togglePhase, isPhaseEnabled };
}
