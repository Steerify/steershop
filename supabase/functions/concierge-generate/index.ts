// SteerSolo Marketing Concierge — generates ONE queued post per group per invocation.
// Cron: every 2 hours between 8am - 8pm WAT (Africa/Lagos).
// Inserts rows into marketing_queue for marketplace, foundry, and vendor groups.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ORIGIN = "https://steersolo.com";
const LINK_PLACEHOLDER_PATTERN = /\n?\s*\[(?:shop|product)?\s*link\]\s*/gi;

function appendSteerSoloLink(caption: string, cta: string, linkUrl: string) {
  const cleanCaption = caption.replace(LINK_PLACEHOLDER_PATTERN, "").trim();
  return `${cleanCaption}\n\n${cta}: ${linkUrl}`;
}

function productUrl(shopSlug: string, productId: string, ref: string) {
  return `${ORIGIN}/shop/${shopSlug}/product/${productId}?ref=${ref}`;
}

type TargetGroup = "marketplace" | "foundry" | "vendor";

type Slot =
  | "morning_pick"
  | "new_arrivals"
  | "lunch_deal"
  | "shop_spotlight"
  | "top5"
  | "featured_store"
  | "conversation"
  | "tech_insight"
  | "community_poll"
  | "founder_story"
  | "sales_tip"
  | "platform_feature"
  | "merchant_win";

function pickSlotForGroup(watHour: number, group: TargetGroup): Slot | null {
  if (group === "marketplace") {
    // Marketplace: 8am, 10am, 12pm, 2pm, 4pm, 6pm, 8pm
    if (watHour < 8 || watHour > 20 || watHour % 2 !== 0) return null;
    const table: Record<number, Slot> = {
      8: "morning_pick",
      10: "new_arrivals",
      12: "lunch_deal",
      14: "shop_spotlight",
      16: "top5",
      18: "featured_store",
      20: "conversation",
    };
    return table[watHour] || null;
  } else if (group === "foundry") {
    // Foundry: 7am, 1pm, 7pm
    if (watHour === 7) return "tech_insight";
    if (watHour === 13) return "community_poll";
    if (watHour === 19) return "founder_story";
    return null;
  } else {
    // Vendor: 7am, 1pm, 7pm
    if (watHour === 7) return "sales_tip";
    if (watHour === 13) return "platform_feature";
    if (watHour === 19) return "merchant_win";
    return null;
  }
}

const SLOT_PROMPT: Record<Slot, string> = {
  // Marketplace
  morning_pick: "Write a warm 'Good morning Naija!' style hook (1 emoji opener), then highlight ONE product as today's morning pick. Friendly, Nigerian English, soft urgency (3–4 sentences).",
  new_arrivals: "Announce this product as a fresh new arrival on SteerSolo. Build curiosity, 3 sentences, end with a soft 'Tap the link to peep it'.",
  lunch_deal: "Frame this as a midday deal. Lead with the discount strikethrough idea ('was X, now Y'), 3 sentences, playful tone.",
  shop_spotlight: "Spotlight this shop. Two sentences about what they sell, one sentence inviting people to visit. Personal, conversational.",
  top5: "Introduce the day's 'Top 5 picks on SteerSolo'. Then list the 5 products as bullet points with name and short benefit (no prices). End with one CTA line.",
  featured_store: "Crown this as 'Featured Store of the Day'. Story-driven (2 short paragraphs). Mention what makes them special. End with a 'Drop a 🙌 if you support naija businesses' nudge.",
  conversation: "Write a short conversation starter / poll for the group. Tie it to a shopping category. Encourage replies. Keep it 2–3 sentences, end with a question.",
  
  // Foundry (Contributors & Builders)
  tech_insight: "You are talking to the 'Foundry' group, a community of contributors, engineers, and builders for the SteerSolo platform. Write a short, encouraging message about the importance of building scalable tech, writing clean code, or celebrating an engineering win. Keep it conversational, 3 sentences.",
  community_poll: "You are talking to the 'Foundry' group (SteerSolo contributors). Ask a thought-provoking poll question about product design, software engineering, or start-up growth in Nigeria. 2 sentences.",
  founder_story: "You are talking to the 'Foundry' group (SteerSolo contributors). Share a brief encouraging word about the journey of building an e-commerce platform from scratch in Africa. Mention resilience, shipping fast, and community effort. 3 sentences.",

  // Vendor (Merchants)
  sales_tip: "You are talking to SteerSolo merchants. Share a quick, actionable e-commerce sales tip (e.g., taking good product photos, writing clear descriptions, or customer service). Professional yet encouraging. 3 sentences.",
  platform_feature: "You are talking to SteerSolo merchants. Remind them to use a platform feature (like sharing their SteerSolo shop link on their IG, or updating their inventory). Keep it hype and supportive. 3 sentences.",
  merchant_win: "You are talking to SteerSolo merchants. Post an encouraging message about the hustle of running a business in Nigeria and how SteerSolo is here to help them reach more buyers. 3 sentences.",
};

async function fetchEligibleShops(supabase: any) {
  const { data, error } = await supabase
    .from("shops")
    .select("id, shop_name, shop_slug, description, logo_url, banner_url, category, city, state, average_rating, total_reviews, is_active")
    .eq("is_active", true)
    .not("shop_slug", "is", null)
    .limit(80);
  if (error) throw error;
  return data || [];
}

async function fetchRecentFeaturedShopIds(supabase: any) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("marketing_queue")
    .select("shop_id")
    .gte("created_at", since);
  return new Set((data || []).map((r: any) => r.shop_id).filter(Boolean));
}

function weightedRandom<T>(items: T[], weight: (t: T) => number): T {
  const total = items.reduce((s, it) => s + Math.max(0.0001, weight(it)), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= Math.max(0.0001, weight(it));
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

async function pickShop(supabase: any) {
  const [eligible, recent] = await Promise.all([
    fetchEligibleShops(supabase),
    fetchRecentFeaturedShopIds(supabase),
  ]);
  const fresh = eligible.filter((s: any) => !recent.has(s.id));
  const pool = fresh.length > 0 ? fresh : eligible;
  if (pool.length === 0) return null;
  return weightedRandom(pool, (s: any) =>
    1 + (Number(s.average_rating) || 0) + Math.log1p(Number(s.total_reviews) || 0)
  );
}

async function fetchProductsForShop(supabase: any, shopId: string, limit = 8) {
  const { data } = await supabase
    .from("products")
    .select("id, name, description, price, compare_price, image_url, shop_id")
    .eq("shop_id", shopId)
    .eq("is_available", true)
    .not("image_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

async function fetchTrendingProducts(supabase: any, limit = 5) {
  const { data } = await supabase
    .from("products")
    .select("id, name, description, price, compare_price, image_url, shop_id, shops!inner(shop_slug, shop_name, is_active)")
    .eq("is_available", true)
    .eq("shops.is_active", true)
    .not("image_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit * 4);
  const shuffled = (data || []).sort(() => Math.random() - 0.5).slice(0, limit);
  return shuffled;
}

async function fetchDiscountProduct(supabase: any) {
  const { data } = await supabase
    .from("products")
    .select("id, name, description, price, compare_price, image_url, shop_id, shops!inner(shop_slug, shop_name, is_active)")
    .eq("is_available", true)
    .eq("shops.is_active", true)
    .not("compare_price", "is", null)
    .not("image_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);
  const list = (data || []).filter((p: any) => Number(p.compare_price) > Number(p.price));
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

async function aiCaption(prompt: string, context: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const sys = `You are a senior Nigerian marketing copywriter for SteerSolo.
RULES:
- Naija English, warm, confident, 1 emoji in the opener.
- 3–5 short sentences max.
- Include a soft group-growth nudge ("share your thoughts", "drop a comment", etc).
- NEVER invent prices, ratings, claims, or URLs.
- DO NOT INCLUDE ANY LINK PLACEHOLDERS like [Shop Link] or [Link]. The link will be appended mechanically by the system after you generate the text.`;

  const body = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: `${prompt}\n\nCONTEXT:\n${context}` },
    ],
  };

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`AI gateway ${r.status}: ${t}`);
  }
  const j = await r.json();
  return (j.choices?.[0]?.message?.content || "").trim();
}

async function generateForSlot(supabase: any, slot: Slot, targetGroup: TargetGroup) {
  const prompt = SLOT_PROMPT[slot];

  // Foundry & Vendor slots
  if (targetGroup === "foundry" || targetGroup === "vendor") {
    let caption = await aiCaption(prompt, "No specific context needed.");
    // Foundry/Vendor posts might not need a product link, but we'll attach SteerSolo main link for context.
    const link_url = ORIGIN;
    caption = appendSteerSoloLink(caption, "Join SteerSolo", link_url);
    
    return {
      slot,
      target_group: targetGroup,
      shop_id: null,
      product_ids: [],
      caption,
      image_url: null,
      link_url,
      meta: {},
    };
  }

  // Marketplace slots
  if (slot === "top5") {
    const items = await fetchTrendingProducts(supabase, 5);
    if (items.length < 3) throw new Error("Not enough products for top5");
    const context = items.map((p: any, i: number) => `${i + 1}. ${p.name} — by ${p.shops.shop_name}`).join("\n");
    let caption = await aiCaption(prompt, context);
    const link_url = `${ORIGIN}/explore?ref=concierge_top5`;
    caption = appendSteerSoloLink(caption, "Check them out here", link_url);
    return {
      slot,
      target_group: targetGroup,
      shop_id: null,
      product_ids: items.map((p: any) => p.id),
      caption,
      image_url: items[0]?.image_url || null,
      link_url,
      meta: { products: items.map((p: any) => ({ id: p.id, name: p.name, shop: p.shops.shop_name })) },
    };
  }

  if (slot === "lunch_deal") {
    const p = await fetchDiscountProduct(supabase);
    if (!p) throw new Error("No discounted product available");
    const ctx = `Product: ${p.name}\nWas: ₦${Number(p.compare_price).toLocaleString()}\nNow: ₦${Number(p.price).toLocaleString()}\nShop: ${p.shops.shop_name}`;
    let caption = await aiCaption(prompt, ctx);
    const link_url = productUrl(p.shops.shop_slug, p.id, "concierge_lunch");
    caption = appendSteerSoloLink(caption, "Grab the deal", link_url);
    return {
      slot,
      target_group: targetGroup,
      shop_id: p.shop_id,
      product_ids: [p.id],
      caption,
      image_url: p.image_url,
      link_url,
      meta: { product: p.name, was: p.compare_price, now: p.price },
    };
  }

  if (slot === "featured_store") {
    const shop = await pickShop(supabase);
    if (!shop) throw new Error("No shop available");
    const products = await fetchProductsForShop(supabase, shop.id, 3);
    const ctx = `Shop: ${shop.shop_name}\nLocation: ${[shop.city, shop.state].filter(Boolean).join(", ") || "Nigeria"}\nRating: ${shop.average_rating || "new"}`;
    let caption = await aiCaption(prompt, ctx);
    const link_url = `${ORIGIN}/shop/${shop.shop_slug}?ref=concierge_featured`;
    caption = appendSteerSoloLink(caption, "Visit their store", link_url);
    return {
      slot,
      target_group: targetGroup,
      shop_id: shop.id,
      product_ids: products.map((p: any) => p.id),
      caption,
      image_url: shop.banner_url || shop.logo_url || products[0]?.image_url || null,
      link_url,
      meta: { shop: shop.shop_name },
    };
  }

  if (slot === "conversation") {
    const ctx = `Active categories: fashion, beauty, electronics, food.`;
    let caption = await aiCaption(prompt, ctx);
    const link_url = `${ORIGIN}/explore?ref=concierge_chat`;
    caption = appendSteerSoloLink(caption, "Join SteerSolo", link_url);
    return {
      slot,
      target_group: targetGroup,
      shop_id: null,
      product_ids: [],
      caption,
      image_url: null,
      link_url,
      meta: {},
    };
  }

  // morning_pick / new_arrivals / shop_spotlight
  const shop = await pickShop(supabase);
  if (!shop) throw new Error("No shop available");
  const products = await fetchProductsForShop(supabase, shop.id, 8);
  if (products.length === 0) throw new Error("Shop has no products");
  const p = products[Math.floor(Math.random() * products.length)];
  const ctx = `Product: ${p.name}\nPrice: ₦${Number(p.price).toLocaleString()}\nShop: ${shop.shop_name}`;
  let caption = await aiCaption(prompt, ctx);
  const link_url = productUrl(shop.shop_slug, p.id, `concierge_${slot}`);
  caption = appendSteerSoloLink(caption, "Tap here to peep it", link_url);
  return {
    slot,
    target_group: targetGroup,
    shop_id: shop.id,
    product_ids: [p.id],
    caption,
    image_url: p.image_url,
    link_url,
    meta: { product: p.name, shop: shop.shop_name },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let forcedSlot: Slot | undefined;
    let forcedHour: number | undefined;
    let forcedGroup: TargetGroup | undefined;
    
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.slot) forcedSlot = body.slot;
        if (typeof body?.hour === "number") forcedHour = body.hour;
        if (body?.group) forcedGroup = body.group;
      } catch {
        // ignore
      }
    }

    const utc = new Date();
    const watHour = typeof forcedHour === "number" ? forcedHour : (utc.getUTCHours() + 1) % 24;

    const targetGroups: TargetGroup[] = forcedGroup ? [forcedGroup] : ["marketplace", "foundry", "vendor"];
    const generatedPosts: any[] = [];

    await Promise.all(targetGroups.map(async (group) => {
      try {
        // Prevent queue overflow: if there are >= 10 pending posts for this group, pause generation
        const { count, error: countErr } = await supabase
          .from("marketing_queue")
          .select("*", { count: "exact", head: true })
          .eq("target_group", group)
          .eq("status", "pending");

        if (countErr) {
          console.error(`Error counting pending posts for ${group}:`, countErr);
        } else if (count !== null && count >= 10) {
          console.log(`Skipping generation for ${group} - ${count} pending posts in queue.`);
          return;
        }

        const slot = forcedSlot ?? pickSlotForGroup(watHour, group);
        if (!slot) return; // Not scheduled for this group at this hour

        const post = await generateForSlot(supabase, slot, group);

        const { data, error } = await supabase
          .from("marketing_queue")
          .insert({
            slot: post.slot,
            target_group: post.target_group,
            shop_id: post.shop_id,
            product_ids: post.product_ids,
            caption: post.caption,
            image_url: post.image_url,
            link_url: post.link_url,
            meta: post.meta,
          })
          .select()
          .single();

        if (error) throw error;
        generatedPosts.push(data);
      } catch (err) {
        console.error(`Failed generating for group ${group}:`, err);
      }
    }));

    return new Response(JSON.stringify({ ok: true, posts: generatedPosts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("concierge-generate error", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
