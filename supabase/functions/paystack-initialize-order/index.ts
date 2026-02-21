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
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!PAYSTACK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { order_id, shop_id, amount, customer_email, callback_url } = body;

    if (!order_id || !shop_id || !amount || !customer_email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: order_id, shop_id, amount, customer_email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look up the shop's subaccount code
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id, shop_name, paystack_subaccount_code')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop) {
      console.error('Shop lookup failed:', shopError);
      return new Response(
        JSON.stringify({ error: 'Shop not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentReference = `ORDER_${order_id}_${Date.now()}`;
    const amountInKobo = Math.round(amount * 100);
    const hasSubaccount = !!shop.paystack_subaccount_code;
    const paymentMode = hasSubaccount ? 'split' : 'direct';

    console.log(`Initializing ${paymentMode} payment:`, {
      shop_id,
      order_id,
      amount,
      subaccount: shop.paystack_subaccount_code || 'none (direct)',
    });

    // Build Paystack payload - include subaccount fields only if shop has one
    const paystackPayload: Record<string, any> = {
      email: customer_email,
      amount: amountInKobo,
      currency: 'NGN',
      reference: paymentReference,
      callback_url: callback_url || undefined,
      metadata: {
        order_id,
        shop_id,
        payment_mode: paymentMode,
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: order_id,
          },
          {
            display_name: "Shop",
            variable_name: "shop_name",
            value: shop.shop_name,
          },
        ],
      },
    };

    if (hasSubaccount) {
      paystackPayload.subaccount = shop.paystack_subaccount_code;
      paystackPayload.bearer = 'subaccount';
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to initialize payment',
          details: paystackData.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment initialized successfully:', {
      reference: paymentReference,
      authorization_url: paystackData.data.authorization_url,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: paystackData.data.reference,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in paystack-initialize-order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
