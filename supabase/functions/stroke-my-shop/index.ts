import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are "Stroke My Shop AI", a hilariously blunt Nigerian friend who roasts entrepreneurs about their shop weaknesses. You mix Pidgin English with regular English naturally. You're like a supportive but savage friend who tells it like it is.

Your personality traits:
- You use Nigerian expressions like "Na wa o!", "Chai!", "Abeg", "Omo", "Wetin be this?", "E pain me", "No vex but..."
- You're direct but not mean-spirited
- You give ACTIONABLE advice after each roast
- You're encouraging at the end

RESPONSE FORMAT:
For each issue you find, use this structure:
🔥 [ROAST]: Your savage but funny observation
💡 [WHY IT MATTERS]: Brief explanation of the impact
✅ [FIX AM]: Specific, actionable advice

End with an encouraging message in pidgin.

THINGS TO ANALYZE:
1. Product count - Too few? Too many without descriptions?
2. Product descriptions - Empty? Too short? Not compelling?
3. Product images - Missing? Low quality mentioned?
4. Pricing - Inconsistent? No prices visible?
5. Shop description - Missing or weak?
6. Shop logo/banner - Missing branding?
7. Reviews - None? Low ratings?
8. WhatsApp number - Missing contact info?

Keep your response to 3-5 issues maximum. Be specific to their actual data.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { shop_id } = await req.json();

    if (!shop_id) {
      return new Response(
        JSON.stringify({ error: 'Shop ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch shop data
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop) {
      return new Response(
        JSON.stringify({ error: 'Shop not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership
    if (shop.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You can only stroke your own shop' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check usage limits using the security definer function
    const { data: usageCheck, error: usageError } = await supabase
      .rpc('check_feature_usage', {
        _user_id: user.id,
        _feature_name: 'stroke_my_shop'
      });

    if (usageError) {
      console.error('Usage check error:', usageError);
    }

    // Parse usage check result
    const usageResult = usageCheck as { can_use: boolean; is_business: boolean; current_usage: number; max_usage: number } | null;

    if (usageResult && !usageResult.can_use) {
      console.log(`User ${user.id} has reached stroke_my_shop limit: ${usageResult.current_usage}/${usageResult.max_usage}`);
      return new Response(
        JSON.stringify({ 
          error: 'Monthly limit reached. Upgrade to Business for unlimited roasts!',
          limit_reached: true,
          current_usage: usageResult.current_usage,
          max_usage: usageResult.max_usage
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch products
    const { data: products } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, stock_quantity, is_available')
      .eq('shop_id', shop_id);

    // Fetch reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, comment')
      .eq('shop_id', shop_id);

    // Prepare shop analysis data
    const shopData = {
      shop_name: shop.shop_name,
      description: shop.description || 'NO DESCRIPTION SET',
      logo_url: shop.logo_url ? 'Has logo' : 'NO LOGO',
      banner_url: shop.banner_url ? 'Has banner' : 'NO BANNER',
      whatsapp_number: shop.whatsapp_number || 'NO WHATSAPP NUMBER',
      average_rating: shop.average_rating || 0,
      total_reviews: shop.total_reviews || 0,
      product_count: products?.length || 0,
      products_without_description: products?.filter(p => !p.description || p.description.length < 20).length || 0,
      products_without_images: products?.filter(p => !p.image_url).length || 0,
      products_out_of_stock: products?.filter(p => p.stock_quantity === 0).length || 0,
      sample_products: products?.slice(0, 5).map(p => ({
        name: p.name,
        description: p.description?.substring(0, 100) || 'NO DESCRIPTION',
        price: p.price,
        has_image: !!p.image_url,
      })) || [],
      recent_reviews: reviews?.slice(0, 3) || [],
    };

    const userPrompt = `Analyze this shop and roast them (lovingly but savagely):

SHOP DATA:
${JSON.stringify(shopData, null, 2)}

Remember to be specific about their actual issues. If their shop is actually good, still find small things to improve but acknowledge they're doing well.`;

    // Call Lovable AI with streaming
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment usage after successful AI call
    const { error: incrementError } = await supabase
      .rpc('increment_feature_usage', {
        _user_id: user.id,
        _feature_name: 'stroke_my_shop'
      });

    if (incrementError) {
      console.error('Failed to increment usage:', incrementError);
    } else {
      console.log(`Incremented stroke_my_shop usage for user ${user.id}`);
    }

    // Stream the response
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error: unknown) {
    console.error('Error in stroke-my-shop:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
