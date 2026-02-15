import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const { reference, business_name, whatsapp_number, business_category } = await req.json();

    if (!reference || !business_name || !whatsapp_number) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: reference, business_name, whatsapp_number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify Paystack payment
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data?.status !== "success") {
      return new Response(JSON.stringify({ error: "Payment verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify amount is N5,000 (500000 kobo)
    if (paystackData.data.amount < 500000) {
      return new Response(JSON.stringify({ error: "Invalid payment amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. AI generates shop description + slug
    const prompt = `You are a branding expert for Nigerian small businesses on the SteerSolo platform. Generate a professional shop description and URL slug.

Business name: ${business_name}
Category: ${business_category || "General"}

You MUST call the generate_shop_branding function with the results.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              name: "generate_shop_branding",
              description: "Generate a professional shop description and URL slug for a Nigerian SME.",
              parameters: {
                type: "object",
                properties: {
                  description: {
                    type: "string",
                    description:
                      "2-3 warm, professional sentences that build instant trust. Mention quality and reliability. Written for Nigerian customers.",
                  },
                  slug: {
                    type: "string",
                    description:
                      "URL-safe slug: lowercase, hyphens only, no special chars, max 30 chars. Based on business name.",
                  },
                },
                required: ["description", "slug"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_shop_branding" } },
      }),
    });

    let shopDescription: string;
    let shopSlug: string;

    if (!aiResponse.ok) {
      console.error("AI gateway error:", aiResponse.status, await aiResponse.text());
      shopDescription = `Welcome to ${business_name}! We offer quality ${business_category || "products and services"} for our valued customers across Nigeria. Shop with confidence.`;
      shopSlug = business_name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 30);
    } else {
      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

      if (!toolCall?.function?.arguments) {
        shopDescription = `Welcome to ${business_name}! Quality ${business_category || "products and services"} you can trust.`;
        shopSlug = business_name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 30);
      } else {
        const result = JSON.parse(toolCall.function.arguments);
        shopDescription = result.description;
        shopSlug = result.slug;
      }
    }

    // 3. Create shop using service role (user has no shop yet, RLS would block)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check slug uniqueness, append number if needed
    let finalSlug = shopSlug;
    let slugAttempt = 0;
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from("shops")
        .select("id")
        .eq("shop_slug", finalSlug)
        .maybeSingle();
      if (!existing) break;
      slugAttempt++;
      finalSlug = `${shopSlug}-${slugAttempt}`;
    }

    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .insert({
        owner_id: userId,
        shop_name: business_name,
        shop_slug: finalSlug,
        description: shopDescription,
        whatsapp_number: whatsapp_number,
        is_active: true,
      })
      .select()
      .single();

    if (shopError) {
      console.error("Shop creation error:", shopError);
      return new Response(JSON.stringify({ error: "Failed to create shop: " + shopError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Record payment in subscription_history
    await supabaseAdmin.from("subscription_history").insert({
      user_id: userId,
      event_type: "dfy_setup",
      amount: 500000,
      payment_reference: reference,
      notes: `Done-For-You store setup for "${business_name}"`,
    });

    // 5. Log activity
    await supabaseAdmin.from("activity_logs").insert({
      user_id: userId,
      action_type: "create",
      resource_type: "shop",
      resource_id: shop.id,
      resource_name: business_name,
      details: { method: "done_for_you", payment_reference: reference },
    });

    return new Response(
      JSON.stringify({
        success: true,
        shop_id: shop.id,
        shop_slug: finalSlug,
        shop_name: business_name,
        shop_description: shopDescription,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("done-for-you-setup error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
