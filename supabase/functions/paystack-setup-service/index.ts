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

    // SECURITY: amount is computed server-side from package_type. The client
    // can no longer dictate how much they pay.
    const PACKAGE_AMOUNTS: Record<string, number> = {
      basic: 250000,    // ₦2,500 in kobo
      standard: 500000, // ₦5,000 in kobo
      premium: 1000000, // ₦10,000 in kobo
    };

    const raw = await req.json();
    const business_name = typeof raw.business_name === 'string' ? raw.business_name.slice(0, 200) : '';
    const business_description = typeof raw.business_description === 'string' ? raw.business_description.slice(0, 1000) : '';
    const instagram_handle = typeof raw.instagram_handle === 'string' ? raw.instagram_handle.slice(0, 100) : '';
    const products_info = typeof raw.products_info === 'string' ? raw.products_info.slice(0, 2000) : '';
    const contact_phone = typeof raw.contact_phone === 'string' ? raw.contact_phone.slice(0, 20) : '';
    const package_type = typeof raw.package_type === 'string' ? raw.package_type : '';

    const amount = PACKAGE_AMOUNTS[package_type];
    if (!amount) {
      return new Response(JSON.stringify({ error: 'Invalid package_type' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!business_name || business_name.length < 2) {
      return new Response(JSON.stringify({ error: 'business_name is required (min 2 chars)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Setup service request:', {
      user_id: user.id,
      business_name,
      package_type,
      amount,
    });

    // Get user profile email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    if (!profile?.email) {
      throw new Error('User profile not found');
    }

    // Create setup request record (pending payment)
    const { data: setupRequest, error: insertError } = await supabase
      .from('setup_requests')
      .insert({
        user_id: user.id,
        business_name,
        business_description,
        instagram_handle,
        products_info,
        contact_phone,
        package_type,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating setup request:', insertError);
      throw new Error('Failed to create setup request');
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: profile.email,
        amount: amount,
        currency: 'NGN',
        metadata: {
          user_id: user.id,
          setup_request_id: setupRequest.id,
          package_type,
          type: 'setup_service',
        },
        callback_url: `${req.headers.get('origin')}/setup-service?verify=true`,
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack error:', paystackData);
      throw new Error(paystackData.message || 'Payment initialization failed');
    }

    console.log('Setup service payment initialized:', {
      user_id: user.id,
      setup_request_id: setupRequest.id,
      reference: paystackData.data.reference,
    });

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        setup_request_id: setupRequest.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Setup service error:', error);
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
