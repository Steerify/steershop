import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription (Business plan or trial)
    const { data: profile } = await supabase
      .from("profiles")
      .select(`
        *,
        subscription_plans:subscription_plan_id (slug)
      `)
      .eq("id", user.id)
      .single();

    const now = new Date();
    const expiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
    const isSubscribed = profile?.is_subscribed && expiresAt && expiresAt > now;
    const isInTrial = !profile?.is_subscribed && expiresAt && expiresAt > now;
    const planSlug = (profile?.subscription_plans as any)?.slug || "basic";
    const isBusinessUser = planSlug === "business";

    // Allow access if: Business user with active sub, OR in trial period
    if (!((isBusinessUser && isSubscribed) || isInTrial)) {
      return new Response(
        JSON.stringify({ error: "Business plan or trial required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, prompt, context } = await req.json();

    if (!type || !prompt) {
      return new Response(
        JSON.stringify({ error: "Type and prompt required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt based on type
    let systemPrompt = "";
    switch (type) {
      case "headline":
        systemPrompt = `You are a marketing expert creating catchy headlines for ${context?.shopName || "a business"}.
Generate a short, punchy headline (max 10 words) that grabs attention.
Be creative, use power words, and make it memorable.
Only output the headline, nothing else.`;
        break;
      case "copy":
        systemPrompt = `You are a copywriter creating marketing text for ${context?.shopName || "a business"}.
Write compelling, persuasive copy that drives action.
Keep it concise (2-4 sentences max) and impactful.
Only output the copy, nothing else.`;
        break;
      case "concept":
        systemPrompt = `You are a creative director giving design direction for ${context?.shopName || "a business"}.
Describe a poster concept briefly: colors, mood, key visual elements, and layout.
Keep it actionable and specific (3-4 sentences).
Only output the concept description, nothing else.`;
        break;
      default:
        systemPrompt = "You are a helpful marketing assistant. Keep responses concise and actionable.";
    }

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI API error:", await aiResponse.text());
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const result = aiData.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error("No result from AI");
    }

    // Log usage
    await supabase.from("marketing_ai_usage").insert({
      user_id: user.id,
      feature_type: type,
      prompt,
      result,
      credits_used: 1,
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in marketing-ai-assist:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
