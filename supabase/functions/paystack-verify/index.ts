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
    const { reference } = await req.json();
    
    if (!reference) {
      throw new Error('Payment reference is required');
    }

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Verifying payment:', { reference, user_id: user.id });

    // Verify payment with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      console.error('Payment verification failed:', {
        reference,
        status: verifyData.data?.status,
      });
      throw new Error('Payment verification failed');
    }

    console.log('Payment verified successfully:', {
      reference,
      user_id: user.id,
      amount: verifyData.data.amount,
      metadata: verifyData.data.metadata,
    });

    // Extract metadata from payment
    const metadata = verifyData.data.metadata || {};
    const planId = metadata.plan_id;
    const billingCycle = metadata.billing_cycle || 'monthly';
    const subscriptionDays = metadata.subscription_days || 30;

    // Get current subscription expiry
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('subscription_expires_at')
      .eq('id', user.id)
      .single();
    
    // Calculate new expiry date
    let newExpiryDate = new Date();
    
    if (currentProfile?.subscription_expires_at) {
      const currentExpiry = new Date(currentProfile.subscription_expires_at);
      // If subscription hasn't expired yet, extend from current expiry
      if (currentExpiry > newExpiryDate) {
        newExpiryDate = currentExpiry;
      }
    }
    
    // Add subscription days based on billing cycle
    newExpiryDate.setDate(newExpiryDate.getDate() + subscriptionDays);

    // Update user profile with subscription info
    const updateData: any = {
      is_subscribed: true,
      subscription_expires_at: newExpiryDate.toISOString(),
      subscription_type: billingCycle,
    };

    // Only set plan_id if it exists in metadata
    if (planId) {
      updateData.subscription_plan_id = planId;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }

    console.log('Subscription activated via verification:', {
      user_id: user.id,
      plan_id: planId,
      billing_cycle: billingCycle,
      expires_at: newExpiryDate.toISOString(),
      reference,
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        subscription_expires_at: newExpiryDate.toISOString(),
        plan_id: planId,
        billing_cycle: billingCycle,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Verification error:', error);
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
