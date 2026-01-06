import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { shop_id } = await req.json();

    if (!shop_id) {
      return new Response(
        JSON.stringify({ error: 'Shop ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch shop data from public view
    const { data: shop, error: shopError } = await supabase
      .from('shops_public')
      .select('*')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop) {
      return new Response(
        JSON.stringify({ error: 'Shop not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch products count
    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shop_id)
      .eq('is_available', true);

    // Fetch total orders
    const { count: orderCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shop_id)
      .eq('status', 'delivered');

    // Fetch recent reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, comment, customer_name, created_at')
      .eq('shop_id', shop_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate shop age
    const createdAt = new Date(shop.created_at);
    const now = new Date();
    const monthsActive = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30));

    // Build shop intelligence
    const intelligence = {
      shop_name: shop.shop_name,
      description: shop.description,
      created_at: shop.created_at,
      months_active: monthsActive,
      total_products: productCount || 0,
      completed_orders: orderCount || 0,
      average_rating: shop.average_rating || 0,
      total_reviews: shop.total_reviews || 0,
      has_logo: !!shop.logo_url,
      has_banner: !!shop.banner_url,
      has_whatsapp: !!shop.whatsapp_number,
      accepts_paystack: shop.payment_method?.includes('paystack') || !!shop.paystack_public_key,
      recent_reviews: reviews || [],
    };

    // Generate AI summary if LOVABLE_API_KEY is available
    let ai_summary = null;
    if (LOVABLE_API_KEY) {
      try {
        const systemPrompt = `You are a helpful assistant that creates brief, friendly shop summaries for customers. 
Be concise (2-3 sentences max). Highlight positive aspects. Use warm, inviting language.
If the shop is new or has few reviews, be encouraging. 
Include specific numbers when relevant (e.g., "50+ happy customers").`;

        const userPrompt = `Create a brief customer-facing summary for this shop:
Shop: ${intelligence.shop_name}
Description: ${intelligence.description || 'Not provided'}
Active for: ${intelligence.months_active} months
Products: ${intelligence.total_products}
Completed orders: ${intelligence.completed_orders}
Rating: ${intelligence.average_rating}/5 from ${intelligence.total_reviews} reviews
Has WhatsApp: ${intelligence.has_whatsapp}`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          ai_summary = aiData.choices?.[0]?.message?.content;
        }
      } catch (aiError) {
        console.warn('AI summary generation failed:', aiError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...intelligence,
          ai_summary,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in know-this-shop:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
