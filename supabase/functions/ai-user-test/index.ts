import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADAEZE_PROMPT = `You are Adaeze, a 28-year-old Lagos-based fashion entrepreneur. You sell clothes and accessories on WhatsApp and Instagram. You have about 200 customers, handle 5-10 orders per week, and are semi-technical — you can use apps but get frustrated by complicated setups.

You just discovered SteerSolo and are trying it out for the first time. Walk through EVERY feature listed below as if you're actually using the platform. Be brutally honest — you're spending your real money and time on this.

Your journey: Sign up with email → Complete onboarding questionnaire → Create your shop → Upload products → Set up payments → Manage orders → Try marketing tools → Check subscription plans → Explore settings

For each step, rate friction from 1 (seamless) to 5 (would abandon). Think about:
- Does this make sense for a Nigerian small business owner?
- Would this save you time vs. your current WhatsApp workflow?
- Are prices reasonable in Naira?
- Is the language clear or too "tech-y"?
- Would you actually use this feature or is it just clutter?
- What's missing that you desperately need?

Be specific. Quote exact button labels, page names, and flows that confuse you. Talk like a real Lagos entrepreneur — use Nigerian English naturally.`;

const TUNDE_PROMPT = `You are Tunde, a 32-year-old Abuja-based professional who shops online frequently. You buy clothes, gadgets, and gifts through Instagram and WhatsApp links. You're comfortable with Paystack and bank transfers. You've been burned by scam sellers before, so trust signals matter a lot to you.

A friend shared a SteerSolo shop link with you. Walk through EVERY customer-facing feature listed below as if you're actually trying to buy something. Be brutally honest.

Your journey: Click shared shop link → Browse products → Check reviews/ratings → Add to cart → Checkout with Paystack → Track order → Try WhatsApp ordering → Browse other shops → Create account → Check wishlist → Look at rewards → Try courses

For each step, rate friction from 1 (seamless) to 5 (would abandon). Think about:
- Do you trust this platform enough to pay?
- Is the checkout smooth or does it feel sketchy?
- Can you easily find what you want?
- How does this compare to Jumia, Konga, or buying directly on Instagram?
- Would you come back or is this a one-time thing?
- What would make you recommend this to friends?

Be specific. Quote exact UI elements that build or break trust. Talk like a real Nigerian online shopper.`;

const toolSchema = {
  type: "function",
  function: {
    name: "user_test_results",
    description: "Return structured user testing feedback for a persona",
    parameters: {
      type: "object",
      properties: {
        persona_name: { type: "string" },
        persona_role: { type: "string", enum: ["shop_owner", "customer"] },
        overall_score: { type: "number", description: "Overall satisfaction 1-10" },
        would_recommend: { type: "boolean" },
        recommendation_quote: { type: "string", description: "A natural quote about whether they'd recommend, in Nigerian English" },
        journey_steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              step_name: { type: "string" },
              description: { type: "string", description: "What they tried to do and what happened" },
              friction_score: { type: "number", description: "1=seamless, 5=would abandon" },
              quote: { type: "string", description: "What they'd say out loud in Nigerian English" },
              status: { type: "string", enum: ["smooth", "minor_issue", "major_issue", "blocker"] },
            },
            required: ["step_name", "description", "friction_score", "quote", "status"],
            additionalProperties: false,
          },
        },
        top_frustrations: {
          type: "array",
          items: { type: "string" },
          description: "Top 3-5 frustrations",
        },
        top_delights: {
          type: "array",
          items: { type: "string" },
          description: "Top 3-5 things they loved",
        },
        feature_requests: {
          type: "array",
          items: {
            type: "object",
            properties: {
              feature: { type: "string" },
              reason: { type: "string" },
              priority: { type: "string", enum: ["must_have", "nice_to_have", "dream"] },
            },
            required: ["feature", "reason", "priority"],
            additionalProperties: false,
          },
        },
        verdict: { type: "string", description: "Final 2-3 sentence verdict in their voice" },
      },
      required: ["persona_name", "persona_role", "overall_score", "would_recommend", "recommendation_quote", "journey_steps", "top_frustrations", "top_delights", "feature_requests", "verdict"],
      additionalProperties: false,
    },
  },
};

async function runPersona(systemPrompt: string, routes: any[], features: string[], apiKey: string) {
  const userPrompt = `Here are ALL the routes and features on SteerSolo. Walk through each one relevant to your role and give your honest feedback:

ROUTES:
${JSON.stringify(routes, null, 2)}

FEATURES:
${JSON.stringify(features, null, 2)}

Remember: Be brutally honest. If something would make you close the tab, say so. If something delights you, say that too. Use your natural voice.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [toolSchema],
      tool_choice: { type: "function", function: { name: "user_test_results" } },
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429) throw new Error("Rate limited. Try again in a moment.");
    if (status === 402) throw new Error("AI credits exhausted. Please top up.");
    const text = await response.text();
    console.error("AI gateway error:", status, text);
    throw new Error(`AI gateway error (${status})`);
  }

  const result = await response.json();
  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return structured results");
  return JSON.parse(toolCall.function.arguments);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { routes, features } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Run both personas in parallel
    const [adaeze, tunde] = await Promise.all([
      runPersona(ADAEZE_PROMPT, routes, features, LOVABLE_API_KEY),
      runPersona(TUNDE_PROMPT, routes, features, LOVABLE_API_KEY),
    ]);

    // Generate aggregate insights
    const allFrustrations = [...(adaeze.top_frustrations || []), ...(tunde.top_frustrations || [])];
    const allRequests = [...(adaeze.feature_requests || []), ...(tunde.feature_requests || [])];
    const avgScore = ((adaeze.overall_score || 0) + (tunde.overall_score || 0)) / 2;

    return new Response(JSON.stringify({
      personas: [adaeze, tunde],
      aggregate: {
        average_score: Math.round(avgScore * 10) / 10,
        total_issues: (adaeze.journey_steps?.filter((s: any) => s.status !== "smooth").length || 0) +
          (tunde.journey_steps?.filter((s: any) => s.status !== "smooth").length || 0),
        total_blockers: (adaeze.journey_steps?.filter((s: any) => s.status === "blocker").length || 0) +
          (tunde.journey_steps?.filter((s: any) => s.status === "blocker").length || 0),
        common_frustrations: allFrustrations,
        priority_requests: allRequests.filter((r: any) => r.priority === "must_have"),
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-user-test error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
