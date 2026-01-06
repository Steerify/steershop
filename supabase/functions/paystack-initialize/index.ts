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

    // Parse request body for plan selection
    const body = await req.json().catch(() => ({}));
    const { plan_slug = 'basic', billing_cycle = 'monthly' } = body;

    console.log('Payment request:', { plan_slug, billing_cycle, user_id: user.id });

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Profile not found');
    }

    // Get the selected subscription plan
    const { data: selectedPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('slug', plan_slug)
      .eq('is_active', true)
      .single();

    if (planError || !selectedPlan) {
      console.error('Plan not found:', plan_slug);
      throw new Error('Invalid subscription plan');
    }

    // Calculate amount based on billing cycle
    let subscriptionAmount = selectedPlan.price_monthly;
    let subscriptionDays = 30;

    if (billing_cycle === 'yearly' && selectedPlan.price_yearly) {
      subscriptionAmount = selectedPlan.price_yearly;
      subscriptionDays = 365;
    }

    // Check for active subscription offer for shop owners
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

    let offerCode = null;
    let originalAmount = subscriptionAmount;

    if (activeOffer && activeOffer.discount_percentage) {
      const discount = subscriptionAmount * (activeOffer.discount_percentage / 100);
      subscriptionAmount = Math.round(subscriptionAmount - discount);
      offerCode = activeOffer.code;
    }

    console.log('Subscription pricing:', {
      plan: selectedPlan.name,
      billing_cycle,
      original: originalAmount,
      final: subscriptionAmount,
      offer_applied: !!activeOffer,
      offer_code: offerCode,
      days: subscriptionDays,
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
          plan_id: selectedPlan.id,
          plan_slug: selectedPlan.slug,
          plan_name: selectedPlan.name,
          billing_cycle,
          subscription_days: subscriptionDays,
          offer_code: offerCode,
          original_amount: originalAmount,
        },
        callback_url: `${req.headers.get('origin')}/dashboard?subscription=verify`,
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
      plan: selectedPlan.name,
      billing_cycle,
    });

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        plan: {
          name: selectedPlan.name,
          amount: subscriptionAmount,
          billing_cycle,
        },
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
