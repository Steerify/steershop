import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { product_name, category, price } = await req.json();

    if (!product_name) {
      return new Response(JSON.stringify({ error: "Product name is required" }), {
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
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check subscription limits
    const { data: usageData } = await supabaseClient.rpc("check_feature_usage", {
      _user_id: user.id,
      _feature_name: "product_description",
    });

    if (usageData && !usageData.can_use) {
      if (usageData.blocked_by_plan) {
        return new Response(JSON.stringify({ error: "AI features require a Pro or Business plan. Upgrade to unlock.", upgrade_required: true }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Monthly AI usage limit reached. Upgrade for more.", limit_reached: true }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a product copywriter for Nigerian small businesses. Generate a compelling product description and price suggestion.

Product: ${product_name}
${category ? `Category: ${category}` : ""}
${price ? `Current price: ₦${price}` : ""}

You MUST respond by calling the generate_product_info function with the results.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_product_info",
              description: "Generate a product description and price suggestion for a Nigerian SME product listing.",
              parameters: {
                type: "object",
                properties: {
                  description: {
                    type: "string",
                    description: "A compelling 2-3 sentence product description. Professional, warm, and trust-building. Mention quality and value."
                  },
                  price_min: {
                    type: "number",
                    description: "Suggested minimum price in Naira for this product in the Nigerian market"
                  },
                  price_max: {
                    type: "number",
                    description: "Suggested maximum price in Naira for this product in the Nigerian market"
                  }
                },
                required: ["description", "price_min", "price_max"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_product_info" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI service rate limited. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("Invalid AI response format");
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Track usage
    await supabaseClient.rpc("increment_feature_usage", {
      _user_id: user.id,
      _feature_name: "product_description",
    });

    // Log to marketing_ai_usage
    await supabaseClient.from("marketing_ai_usage").insert({
      user_id: user.id,
      feature_type: "product_description",
      prompt: product_name,
      result: result.description,
    });

    return new Response(JSON.stringify({
      description: result.description,
      price_suggestion: { min: result.price_min, max: result.price_max },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("ai-product-description error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
