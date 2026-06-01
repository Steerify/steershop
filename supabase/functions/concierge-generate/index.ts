// SteerSolo Marketing Concierge — generates ONE queued post per invocation.
// Cron: every 2 hours. Picks a slot format based on the WAT (Africa/Lagos) hour,
// selects a shop/product using fairness + performance weighting, asks Lovable AI
// for a Naija-English caption, and inserts a row into marketing_queue.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ORIGIN = "https://steersolo.com";

type Slot =
  | "morning_pick"
  | "new_arrivals"
  | "lunch_deal"
  | "shop_spotlight"
  | "top5"
  | "featured_store"
  | "conversation";

function pickSlot(forcedHour?: number): Slot {
  // Compute WAT hour (UTC+1, no DST)
  const utc = new Date();
  const watHour =
    typeof forcedHour === "number" ? forcedHour : (utc.getUTCHours() + 1) % 24;

  const table: Record<number, Slot> = {
    9: "morning_pick",
    11: "new_arrivals",
    13: "lunch_deal",
    15: "shop_spotlight",
    17: "top5",
    19: "featured_store",
    21: "conversation",
  };
  // Nearest slot if cron runs slightly off
  const nearest = Object.keys(table)
    .map(Number)
    .reduce((a, b) => (Math.abs(b - watHour) < Math.abs(a - watHour) ? b : a));
  return table[nearest];
}

const SLOT_PROMPT: Record<Slot, string> = {
  morning_pick:
    "Write a warm 'Good morning Naija!' style hook (1 emoji opener), then highlight ONE product as today's morning pick. Friendly, Nigerian English, soft urgency (3–4 sentences).",
  new_arrivals:
    "Announce this product as a fresh new arrival on SteerSolo. Build curiosity, 3 sentences, end with a soft 'Tap the link to peep it'.",
  lunch_deal:
    "Frame this as a midday deal. Lead with the discount strikethrough idea ('was X, now Y'), 3 sentences, playful tone.",
  shop_spotlight:
    "Spotlight this shop. Two sentences about what they sell, one sentence inviting people to visit. Personal, conversational.",
  top5:
    "Introduce the day's 'Top 5 picks on SteerSolo'. Then list the 5 products as bullet points with name and short benefit (no prices). End with one CTA line.",
  featured_store:
    "Crown this as 'Featured Store of the Day'. Story-driven (2 short paragraphs). Mention what makes them special. End with a 'Drop a 🙌 if you support naija businesses' nudge.",
  conversation:
    "Write a short conversation starter / poll for the group. Tie it to a shopping category. Encourage replies. Keep it 2–3 sentences, end with a question.",
};

async function fetchEligibleShops(supabase: any) {
  // Active shops, not featured by concierge in last 7d.
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
  // Most-viewed shops' newest in-stock products
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
  const list = (data || []).filter(
    (p: any) => Number(p.compare_price) > Number(p.price)
  );
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

async function aiCaption(prompt: string, context: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const sys = `You are a senior Nigerian marketing copywriter for SteerSolo, a marketplace of small Nigerian businesses. You write WhatsApp group promo posts that feel like a friend sharing a good find, NEVER spammy. House style:
- Naija English, warm, confident, 1 emoji in the opener.
- 3–5 short sentences max (unless the format demands a list).
- Always end with the shop/product link.
- Include a soft group-growth nudge ("share with someone who needs this", "drop your thoughts", etc).
- Never invent prices, ratings, or claims. Use only the context provided.
- All prices in Naira (₦). No "$" or other currencies.`;

  const body = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: `${prompt}\n\nCONTEXT:\n${context}` },
    ],
  };

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`AI gateway ${r.status}: ${t}`);
  }
  const j = await r.json();
  return (j.choices?.[0]?.message?.content || "").trim();
}

async function generateForSlot(supabase: any, slot: Slot) {
  const prompt = SLOT_PROMPT[slot];

  if (slot === "top5") {
    const items = await fetchTrendingProducts(supabase, 5);
    if (items.length < 3) throw new Error("Not enough products for top5");
    const context = items
      .map(
        (p: any, i: number) =>
          `${i + 1}. ${p.name} — ${p.description?.slice(0, 80) || ""} — by ${p.shops.shop_name}`
      )
      .join("\n");
    const caption = await aiCaption(prompt, context);
    const link = `${ORIGIN}/explore?ref=concierge_top5`;
    return {
      slot,
      shop_id: null,
      product_ids: items.map((p: any) => p.id),
      caption,
      image_url: items[0]?.image_url || null,
      link_url: link,
      meta: { products: items.map((p: any) => ({ id: p.id, name: p.name, shop: p.shops.shop_name })) },
    };
  }

  if (slot === "lunch_deal") {
    const p = await fetchDiscountProduct(supabase);
    if (!p) throw new Error("No discounted product available");
    const ctx = `Product: ${p.name}\nDescription: ${p.description || ""}\nWas: ₦${Number(p.compare_price).toLocaleString()}\nNow: ₦${Number(p.price).toLocaleString()}\nShop: ${p.shops.shop_name}`;
    const caption = await aiCaption(prompt, ctx);
    return {
      slot,
      shop_id: p.shop_id,
      product_ids: [p.id],
      caption,
      image_url: p.image_url,
      link_url: `${ORIGIN}/shop/${p.shops.shop_slug}?ref=concierge_lunch`,
      meta: { product: p.name, was: p.compare_price, now: p.price },
    };
  }

  if (slot === "featured_store") {
    const shop = await pickShop(supabase);
    if (!shop) throw new Error("No shop available");
    const products = await fetchProductsForShop(supabase, shop.id, 3);
    const ctx = `Shop: ${shop.shop_name}\nDescription: ${shop.description || ""}\nLocation: ${[shop.city, shop.state].filter(Boolean).join(", ")}\nRating: ${shop.average_rating || "new"}\nSample products: ${products.map((p: any) => p.name).join(", ") || "various"}`;
    const caption = await aiCaption(prompt, ctx);
    return {
      slot,
      shop_id: shop.id,
      product_ids: products.map((p: any) => p.id),
      caption,
      image_url: shop.banner_url || shop.logo_url || products[0]?.image_url || null,
      link_url: `${ORIGIN}/shop/${shop.shop_slug}?ref=concierge_featured`,
      meta: { shop: shop.shop_name },
    };
  }

  if (slot === "conversation") {
    const ctx = `Today's WAT hour: ${new Date().getUTCHours() + 1}. Active categories on the platform: fashion, beauty, electronics, food & drinks, home, art & craft, services.`;
    const caption = await aiCaption(prompt, ctx);
    return {
      slot,
      shop_id: null,
      product_ids: [],
      caption,
      image_url: null,
      link_url: `${ORIGIN}/explore?ref=concierge_chat`,
      meta: {},
    };
  }

  // morning_pick / new_arrivals / shop_spotlight all use a single product from a chosen shop
  const shop = await pickShop(supabase);
  if (!shop) throw new Error("No shop available");
  const products = await fetchProductsForShop(supabase, shop.id, 8);
  if (products.length === 0) throw new Error("Shop has no products");
  const p = products[Math.floor(Math.random() * products.length)];
  const ctx = `Product: ${p.name}\nDescription: ${p.description || ""}\nPrice: ₦${Number(p.price).toLocaleString()}\nShop: ${shop.shop_name}\nLocation: ${[shop.city, shop.state].filter(Boolean).join(", ") || "Nigeria"}`;
  const caption = await aiCaption(prompt, ctx);
  return {
    slot,
    shop_id: shop.id,
    product_ids: [p.id],
    caption,
    image_url: p.image_url,
    link_url: `${ORIGIN}/shop/${shop.shop_slug}?ref=concierge_${slot}`,
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

    // Allow forcing a specific slot via body for manual admin "regenerate"
    let forcedSlot: Slot | undefined;
    let forcedHour: number | undefined;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.slot) forcedSlot = body.slot;
        if (typeof body?.hour === "number") forcedHour = body.hour;
      } catch {
        // ignore
      }
    }

    const slot = forcedSlot ?? pickSlot(forcedHour);
    const post = await generateForSlot(supabase, slot);

    const { data, error } = await supabase
      .from("marketing_queue")
      .insert({
        slot: post.slot,
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

    return new Response(JSON.stringify({ ok: true, post: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("concierge-generate error", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
