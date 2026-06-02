import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseSeoDna(content: string) {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid SEO data. Please try again.");
  }

  const rawDescription = typeof parsed.seo_description === "string" ? parsed.seo_description.trim() : "";
  const seoDescription = rawDescription.length > 160 ? rawDescription.slice(0, 157).trimEnd() + "..." : rawDescription;
  const seoKeywords = Array.isArray(parsed.seo_keywords)
    ? parsed.seo_keywords
        .filter((keyword): keyword is string => typeof keyword === "string")
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean)
        .filter((keyword, index, all) => all.indexOf(keyword) === index)
        .slice(0, 15)
    : [];
  const semanticNiche = typeof parsed.semantic_niche === "string" ? parsed.semantic_niche.trim() : "";

  if (!seoDescription || seoKeywords.length < 3 || !semanticNiche) {
    throw new Error("AI returned incomplete SEO data. Please try again.");
  }

  return {
    seo_description: seoDescription,
    seo_keywords: seoKeywords,
    semantic_niche: semanticNiche,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { shop_id } = await req.json();

    if (!shop_id || typeof shop_id !== "string") {
      return jsonResponse({ error: "Shop ID is required" }, 400);
    }

    const authHeader = req.headers.get("Authorization");
    const accessToken = authHeader?.replace(/^Bearer\s+/i, "");
    if (!accessToken) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: authData, error: authError } = await supabaseClient.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // 1. Fetch Shop Details and verify ownership before using the service-role client to save.
    const { data: shop, error: shopError } = await supabaseClient
      .from("shops")
      .select("id, owner_id, shop_name, description")
      .eq("id", shop_id)
      .single();

    if (shopError || !shop) {
      throw new Error("Shop not found");
    }

    if (shop.owner_id !== authData.user.id) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    // 2. Fetch Sample Products
    const { data: products } = await supabaseClient
      .from("products")
      .select("name, description")
      .eq("shop_id", shop_id)
      .limit(15);

    const productNames = products?.map((p) => p.name).filter(Boolean).join(", ") || "";
    const productDescs = products?.map((p) => p.description).filter(Boolean).slice(0, 5).join("\n") || "";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are an expert SEO strategist for Nigerian e-commerce. Generate a high-converting "SEO DNA" for the following store.
    
Store Name: ${shop.shop_name}
Description: ${shop.description || "N/A"}
Sample Products: ${productNames || "N/A"}
Product Details: ${productDescs || "N/A"}

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
          { role: "system", content: "You are a specialized e-commerce SEO bot. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI service failed: ${response.status} ${errorText}`);
    }

    const aiResponse = await response.json();
    const seoDNA = parseSeoDna(aiResponse.choices?.[0]?.message?.content || "");
    const updatedAt = new Date().toISOString();

    // 3. Update Shop and return the saved database row so the UI can confirm persistence.
    const { data: savedShop, error: updateError } = await supabaseClient
      .from("shops")
      .update({
        seo_description: seoDNA.seo_description,
        seo_keywords: seoDNA.seo_keywords,
        seo_metadata: {
          semantic_niche: seoDNA.semantic_niche,
          generated_by: "AI_DNA_ENGINE_V1",
        },
        seo_dna_updated_at: updatedAt,
      })
      .eq("id", shop_id)
      .eq("owner_id", authData.user.id)
      .select("id, seo_description, seo_keywords, seo_metadata, seo_dna_updated_at")
      .single();

    if (updateError || !savedShop) throw updateError || new Error("SEO data was not saved");

    return jsonResponse({
      success: true,
      data: savedShop,
    });
  } catch (e) {
    console.error("generate-shop-seo-dna error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
