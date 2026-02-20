import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { shopName, shopDescription, productName, productDescription, productPrice, platform, targetAudience, budgetRange } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const platformGuides: Record<string, string> = {
      google: `Generate Google Ads content:
- Headline 1 (max 30 chars), Headline 2 (max 30 chars), Headline 3 (max 30 chars)
- Description 1 (max 90 chars), Description 2 (max 90 chars)
- Display URL path
- Keywords to target (10-15)
- Negative keywords (5-10)
- Recommended daily budget in Naira
- Campaign type recommendation (Search, Display, Shopping)`,
      facebook: `Generate Facebook/Instagram Ads content:
- Primary text (125 chars for optimal, up to 500)
- Headline (max 40 chars)
- Description (max 30 chars for link ads)
- Call to action button recommendation
- 5 audience targeting suggestions (interests, demographics, behaviors)
- Recommended daily budget in Naira
- Ad format recommendation (Single image, Carousel, Video)
- 10 relevant hashtags`,
      tiktok: `Generate TikTok Ads content:
- Ad text (max 100 chars)
- CTA button recommendation
- Video script idea (15-30 seconds)
- Trending sounds/music suggestions
- 10 hashtags including trending Nigerian ones
- Audience targeting suggestions
- Recommended daily budget in Naira`,
      whatsapp: `Generate WhatsApp Status/Broadcast content:
- Status text (concise, engaging, with emojis)
- Broadcast message template
- Caption for status image
- 3 different message variations for different times of day
- Call to action with store link placeholder
- Follow-up message template`,
    };

    const systemPrompt = `You are an expert Nigerian digital marketing specialist who creates high-converting ad copy for small businesses in Nigeria. You understand Nigerian culture, slang, and buying behavior. All prices are in Naira (₦). Your copy should be relatable, professional, and drive action.

Always return a valid JSON object with this structure:
{
  "headline": "string",
  "bodyText": "string",
  "callToAction": "string",
  "targetingSuggestions": ["string"],
  "budgetRecommendation": "string",
  "hashtags": ["string"],
  "additionalTips": ["string"],
  "imagePrompt": "string describing ideal ad image",
  "variations": [{"headline": "string", "bodyText": "string"}]
}`;

    const userPrompt = `Create ad content for the ${platform} platform.

Business: ${shopName}
${shopDescription ? `About: ${shopDescription}` : ""}
${productName ? `Product: ${productName}` : ""}
${productDescription ? `Product Details: ${productDescription}` : ""}
${productPrice ? `Price: ₦${productPrice}` : ""}
${targetAudience ? `Target Audience: ${targetAudience}` : "Target: Nigerian consumers aged 18-45"}
${budgetRange ? `Budget: ${budgetRange}` : "Budget: ₦1,000 - ₦5,000/day"}

${platformGuides[platform] || platformGuides.facebook}

Make it compelling for Nigerian audiences. Use relatable language. Include urgency where appropriate.`;

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
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from the response
    let adContent;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      adContent = jsonMatch ? JSON.parse(jsonMatch[0]) : { headline: content, bodyText: "", callToAction: "Shop Now" };
    } catch {
      adContent = { headline: "Check out our amazing products!", bodyText: content, callToAction: "Shop Now", targetingSuggestions: [], hashtags: [], additionalTips: [], budgetRecommendation: "₦2,000 - ₦5,000/day" };
    }

    return new Response(JSON.stringify({ success: true, data: adContent, platform }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ad-copy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
