import { supabase } from "@/integrations/supabase/client";

export interface AdCopyRequest {
  shopName: string;
  shopDescription?: string;
  productName?: string;
  productDescription?: string;
  productPrice?: number;
  platform: "google" | "facebook" | "tiktok" | "whatsapp";
  targetAudience?: string;
  budgetRange?: string;
}

export interface AdCopyResult {
  headline: string;
  bodyText: string;
  callToAction: string;
  targetingSuggestions: string[];
  budgetRecommendation: string;
  hashtags: string[];
  additionalTips: string[];
  imagePrompt: string;
  variations?: { headline: string; bodyText: string }[];
}

export const adsService = {
  async generateAdCopy(request: AdCopyRequest): Promise<{ success: boolean; data?: AdCopyResult; error?: string }> {
    const { data, error } = await supabase.functions.invoke("generate-ad-copy", {
      body: request,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true, data: data?.data };
  },
};
