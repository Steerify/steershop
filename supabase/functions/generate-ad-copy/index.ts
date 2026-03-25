import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      shopName,
      shopDescription,
      productName,
      productDescription,
      productPrice,
      platform,
      targetAudience,
      budgetRange,
    } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    // ─── Platform-specific creative briefs ──────────────────────────────────────
    const platformGuides: Record<string, string> = {
      google: `Platform: Google Search Ads
Craft copy that captures HIGH-INTENT buyers searching for this product.
Requirements:
- Headline (max 30 chars, punchy, keyword-rich)
- Body text (2–3 sentences, benefit-focused, urgency)
- CTA (e.g. "Shop Now", "Order Today", "Get Yours")
- 10–15 keyword suggestions Nigerians would search
- 5 negative keywords to exclude
- Campaign type recommendation (Search / Shopping / Display)`,

      facebook: `Platform: Facebook & Instagram Ads
Craft copy that stops the scroll and drives clicks. Nigerians on Facebook respond to trust signals, social proof, and FOMO.
Requirements:
- Headline (max 40 chars, bold claim or question)
- Body text (conversational, 100–200 words, can use light Pidgin)
- Strong CTA with urgency
- 10 hashtags (mix of Nigerian + niche)
- 5 audience targeting suggestions (interests, behaviors, demographics)
- Ad format recommendation (Single Image / Carousel / Reel)`,

      tiktok: `Platform: TikTok Ads
Nigerian Gen-Z and millennials dominate TikTok. Copy must be energetic, trendy, and fun.
Requirements:
- Hook-first text (first 3 words must stop the scroll)
- Body text (direct, punchy, max 100 chars with emojis)
- CTA (must feel organic, not salesy)
- 15-second video script idea
- 10 trending hashtags (include popular Nigerian TikTok tags)
- Sound/music style suggestion`,

      whatsapp: `Platform: WhatsApp Status & Broadcast
Nigerians trust WhatsApp for personal recommendations. Copy should feel like a message from a friend.
Requirements:
- Status caption (short, emoji-rich, hook in first line)
- Broadcast message (3–5 sentences, warm and personal, light Pidgin welcome)
- 3 message variations (morning / afternoon / evening sends)
- Follow-up message for non-responders
- CTA with link placeholder [SHOP_LINK]`,
    };

    // ─── System prompt (culturally tuned Nigerian marketer) ──────────────────────
    const systemPrompt = `You are Marcus, an elite Nigerian digital marketing strategist with 10 years of experience running high-converting campaigns for SMEs across Lagos, Abuja, Port Harcourt, and beyond.

You KNOW Nigerian consumers deeply:
- They respond to FOMO, trust, social proof, and urgency
- Light Pidgin ("Abeg", "No dulling", "Omo see price!", "You go thank yourself") builds rapport — use it judiciously on casual platforms
- Naira pricing matters — always frame value clearly
- WhatsApp is the most trusted platform for commerce
- Nigerians are savvy buyers — avoid hype without substance

Your ad copy must be:
✅ Platform-native (not generic)
✅ Emotionally resonant
✅ Action-driving
✅ Culturally accurate

ALWAYS return a valid JSON object with EXACTLY this structure (no markdown, no extra text):
{
  "headline": "string",
  "bodyText": "string",
  "callToAction": "string",
  "targetingSuggestions": ["string", "string", "string"],
  "budgetRecommendation": "string",
  "hashtags": ["#tag1", "#tag2"],
  "additionalTips": ["string", "string", "string"],
  "imagePrompt": "string describing ideal ad visual in detail",
  "variations": [
    { "headline": "string", "bodyText": "string" },
    { "headline": "string", "bodyText": "string" }
  ]
}`;

    // ─── User prompt ─────────────────────────────────────────────────────────────
    const userPrompt = `Generate a high-converting ${platform.toUpperCase()} ad campaign for this Nigerian business.

BUSINESS DETAILS:
- Name: ${shopName}
${shopDescription ? `- Description: ${shopDescription}` : ""}
${productName ? `- Featured Product: ${productName}` : ""}
${productDescription ? `- Product Details: ${productDescription}` : ""}
${productPrice ? `- Price: ₦${Number(productPrice).toLocaleString()}` : ""}
- Target Audience: ${targetAudience || "Nigerian consumers aged 18–45, mobile-first, value-conscious"}
- Daily Budget: ${budgetRange || "₦2,000 – ₦5,000/day"}

CREATIVE BRIEF:
${platformGuides[platform] || platformGuides.facebook}

Generate 2 alternate variations in the "variations" array. Make the main copy and variations distinctly different in tone (e.g. one direct/urgent, one warm/story-driven).`;

    // ─── OpenAI API call ─────────────────────────────────────────────────────────
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.85,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let adContent;
    try {
      adContent = JSON.parse(content);
    } catch {
      // Fallback: try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      adContent = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : {
            headline: "Check Out Our Amazing Products!",
            bodyText: content,
            callToAction: "Shop Now",
            targetingSuggestions: [],
            hashtags: [],
            additionalTips: [],
            budgetRecommendation: "₦2,000 – ₦5,000/day",
            imagePrompt: "",
            variations: [],
          };
    }

    return new Response(JSON.stringify({ success: true, data: adContent, platform }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ad-copy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
