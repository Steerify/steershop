import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!PAYSTACK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { shop_id, business_name, bank_code, account_number } = body;

    if (!shop_id || !business_name || !bank_code || !account_number) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify shop ownership
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id, owner_id, shop_name')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop || shop.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Shop not found or unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First, verify the account number with Paystack
    console.log('Verifying account number...');
    const verifyResponse = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();
    
    if (!verifyResponse.ok || !verifyData.status) {
      console.error('Account verification failed:', verifyData);
      return new Response(
        JSON.stringify({ 
          error: 'Could not verify account number. Please check and try again.',
          details: verifyData.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accountName = verifyData.data.account_name;
    console.log('Account verified:', accountName);

    // Create subaccount with Paystack
    console.log('Creating subaccount...');
    const createResponse = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: business_name,
        settlement_bank: bank_code,
        account_number: account_number,
        percentage_charge: 3, // SteerSolo takes 3% commission
        primary_contact_email: user.email,
      }),
    });

    const createData = await createResponse.json();

    if (!createResponse.ok || !createData.status) {
      console.error('Subaccount creation failed:', createData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create payment account',
          details: createData.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subaccountCode = createData.data.subaccount_code;
    console.log('Subaccount created:', subaccountCode);

    // Update shop with subaccount info
    const { error: updateError } = await supabase
      .from('shops')
      .update({
        paystack_subaccount_code: subaccountCode,
        settlement_bank_code: bank_code,
        settlement_account_number: account_number,
      })
      .eq('id', shop_id);

    if (updateError) {
      console.error('Failed to update shop:', updateError);
      // Don't fail - the subaccount was created successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          subaccount_code: subaccountCode,
          account_name: accountName,
          bank_code: bank_code,
          account_number: account_number,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in paystack-create-subaccount:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
