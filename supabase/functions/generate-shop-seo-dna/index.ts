import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { shop_id } = await req.json();

    if (!shop_id) {
      return new Response(JSON.stringify({ error: "Shop ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Fetch Shop Details
    const { data: shop, error: shopError } = await supabaseClient
      .from('shops')
      .select('shop_name, description')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop) {
      throw new Error("Shop not found");
    }

    // 2. Fetch Sample Products
    const { data: products } = await supabaseClient
      .from('products')
      .select('name, description')
      .eq('shop_id', shop_id)
      .limit(15);

    const productNames = products?.map(p => p.name).join(", ") || "";
    const productDescs = products?.map(p => p.description).slice(0, 5).join("\n") || "";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are an expert SEO strategist for Nigerian e-commerce. Generate a high-converting "SEO DNA" for the following store.
    
Store Name: ${shop.shop_name}
Description: ${shop.description || "N/A"}
Sample Products: ${productNames}
Product Details: ${productDescs}

Tasks:
1. Generate a compelling, punchy SEO meta description (max 160 characters).
2. Identify 12-15 high-intent keywords (mixture of short and long-tail).
3. Identify the core "Semantic Niche" of this store.

Respond ONLY with a JSON object containing:
{
  "seo_description": "...",
  "seo_keywords": ["keyword1", "keyword2", ...],
  "semantic_niche": "..."
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp",
        messages: [
          { role: "system", content: "You are a specialized e-commerce SEO bot." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) throw new Error("AI service failed");

    const aiResponse = await response.json();
    const seoDNA = JSON.parse(aiResponse.choices[0].message.content);

    // 3. Update Shop
    const { error: updateError } = await supabaseClient
      .from('shops')
      .update({
        seo_description: seoDNA.seo_description,
        seo_keywords: seoDNA.seo_keywords,
        seo_metadata: {
          semantic_niche: seoDNA.semantic_niche,
          generated_by: "AI_DNA_ENGINE_V1"
        },
        seo_dna_updated_at: new Date().toISOString()
      })
      .eq('id', shop_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      success: true,
      data: seoDNA
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-shop-seo-dna error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
