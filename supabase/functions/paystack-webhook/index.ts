import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(paystackSecretKey);
    const messageData = encoder.encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== computedSignature) {
      console.error('Invalid signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', {
      event: event.event,
      reference: event.data.reference,
      amount: event.data.amount,
      customer_email: event.data.customer?.email,
    });

    // Handle successful payment
    if (event.event === 'charge.success') {
      const { user_id } = event.data.metadata;
      console.log('Processing subscription activation for user:', user_id);
      
      // Get current subscription expiry
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('subscription_expires_at')
        .eq('id', user_id)
        .single();
      
      // Calculate new expiry date (30 days from current expiry or now, whichever is later)
      let newExpiryDate = new Date();
      
      if (currentProfile?.subscription_expires_at) {
        const currentExpiry = new Date(currentProfile.subscription_expires_at);
        // If subscription hasn't expired yet, extend from current expiry
        if (currentExpiry > newExpiryDate) {
          newExpiryDate = currentExpiry;
        }
      }
      
      // Add 30 days
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_subscribed: true,
          subscription_expires_at: newExpiryDate.toISOString(),
        })
        .eq('id', user_id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log('Subscription successfully activated:', {
        user_id,
        expires_at: newExpiryDate.toISOString(),
        amount: event.data.amount,
        reference: event.data.reference,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
