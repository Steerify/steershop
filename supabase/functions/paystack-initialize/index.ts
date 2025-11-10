import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Profile not found');
    }

    // Get active subscription offer for shop owners
    const { data: activeOffer } = await supabase
      .from('special_offers')
      .select('*')
      .eq('target_audience', 'shop_owners')
      .eq('is_active', true)
      .eq('applies_to_subscription', true)
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Calculate subscription amount based on active offer
    let subscriptionAmount = 100000; // Default: ₦1,000 in kobo
    let offerCode = null;

    if (activeOffer) {
      if (activeOffer.subscription_price) {
        // Use explicit subscription price from offer
        subscriptionAmount = activeOffer.subscription_price;
      } else if (activeOffer.discount_percentage) {
        // Calculate price based on discount percentage
        const discount = (activeOffer.original_price || 100000) * (activeOffer.discount_percentage / 100);
        subscriptionAmount = Math.round((activeOffer.original_price || 100000) - discount);
      }
      offerCode = activeOffer.code;
    }

    console.log('Subscription pricing:', {
      original: 100000,
      final: subscriptionAmount,
      offer_applied: !!activeOffer,
      offer_code: offerCode,
    });

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: profile.email,
        amount: subscriptionAmount,
        currency: 'NGN',
        metadata: {
          user_id: user.id,
          subscription_type: 'monthly',
          offer_code: offerCode,
          original_amount: 100000,
        },
        callback_url: `${req.headers.get('origin')}/dashboard`,
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Payment initialization failed:', {
        user_id: user.id,
        error: paystackData.message,
      });
      throw new Error(paystackData.message || 'Payment initialization failed');
    }

    console.log('Payment initialized successfully:', {
      user_id: user.id,
      email: profile.email,
      reference: paystackData.data.reference,
      amount: subscriptionAmount,
      offer_code: offerCode,
    });

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error initializing payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
