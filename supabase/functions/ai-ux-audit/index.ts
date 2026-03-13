import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify admin
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

    const systemPrompt = `You are a senior UX auditor for a Nigerian e-commerce SaaS platform called SteerSolo. 
Analyze the provided routes and features list for UX issues that could hurt user adoption and retention.

For each issue found, provide:
- severity: "critical" | "major" | "minor"
- category: "usability" | "accessibility" | "performance" | "onboarding" | "dead_feature" | "broken_flow" | "missing_feature"
- route: the affected route or "global"
- title: short description
- description: detailed explanation
- recommendation: actionable fix

Return your analysis using the audit_results tool.`;

    const userPrompt = `Analyze these routes and features for UX issues:

ROUTES:
${JSON.stringify(routes, null, 2)}

FEATURES:
${JSON.stringify(features, null, 2)}

Consider:
1. Dead routes or features with no clear value
2. Onboarding gaps (missing data collection, confusing flows)
3. Missing error states or loading states
4. Accessibility issues (missing labels, poor contrast clues)
5. Performance concerns (eager loading, redundant fetches)
6. Broken or incomplete user journeys
7. Features that may confuse or overwhelm new users
8. Missing feedback mechanisms (no confirmation, no progress indicators)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "audit_results",
            description: "Return structured UX audit findings",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "Executive summary of findings" },
                score: { type: "number", description: "Overall UX score 0-100" },
                findings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      severity: { type: "string", enum: ["critical", "major", "minor"] },
                      category: { type: "string" },
                      route: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      recommendation: { type: "string" },
                    },
                    required: ["severity", "category", "route", "title", "description", "recommendation"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["summary", "score", "findings"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "audit_results" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("AI did not return structured results");
    }

    const auditData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(auditData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-ux-audit error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
