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

    // Verify webhook signature
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(paystackSecretKey + body)
    );
    const expectedSignature = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const event = JSON.parse(body);
    console.log('Received webhook event:', event.event);

    // Handle successful charge event
    if (event.event === 'charge.success') {
      const { user_id, order_id, shop_id } = event.data.metadata || {};
      
      console.log('Processing charge.success:', { user_id, order_id, shop_id });

      // If this is a subscription payment (has user_id OR a plan code)
      const planCode = event.data.plan?.plan_code;
      const customerEmail = event.data.customer.email;
      
      if ((user_id && !order_id) || planCode) {
        let finalUserId = user_id;

        // If user_id is missing (recurring charge), find user by email
        if (!finalUserId && customerEmail) {
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', customerEmail)
            .maybeSingle();
          
          if (profileByEmail) {
            finalUserId = profileByEmail.id;
          }
        }

        if (finalUserId) {
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('subscription_expires_at, subscription_type')
            .eq('id', finalUserId)
            .single();
          
          let newExpiryDate = new Date();
          
          if (currentProfile?.subscription_expires_at) {
            const currentExpiry = new Date(currentProfile.subscription_expires_at);
            if (currentExpiry > newExpiryDate) {
              newExpiryDate = currentExpiry;
            }
          }
          
          // Determine subscription days (default to 30)
          let daysToAdd = 30;
          if (event.data.metadata?.subscription_days) {
            daysToAdd = event.data.metadata.subscription_days;
          } else if (currentProfile?.subscription_type === 'yearly' || (planCode && planCode.includes('year'))) {
            // Heuristic for recurring charges if metadata is lost
            daysToAdd = 365;
          }

          newExpiryDate.setDate(newExpiryDate.getDate() + daysToAdd);

          const updateData: any = {
            is_subscribed: true,
            subscription_expires_at: newExpiryDate.toISOString(),
          };

          // If metadata contains plan_id, update it
          if (event.data.metadata?.plan_id) {
            updateData.subscription_plan_id = event.data.metadata.plan_id;
          }
          if (event.data.metadata?.billing_cycle) {
            updateData.subscription_type = event.data.metadata.billing_cycle;
          }

          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', finalUserId);

          if (updateError) {
            console.error('Error updating subscription:', updateError);
          } else {
            console.log('Subscription updated via webhook:', {
              user_id: finalUserId,
              expires_at: newExpiryDate.toISOString(),
              event: event.event,
              is_recurring: !!planCode
            });
          }
        } else {
          console.error('Could not identify user for subscription charge:', {
            email: customerEmail,
            reference: event.data.reference
          });
        }
      }

      // If this is an order payment (has order_id and shop_id) - record revenue
      if (order_id && shop_id) {
        const amount = event.data.amount / 100; // Paystack sends amount in kobo

        // Record revenue transaction
        const { error: revenueError } = await supabase
          .from('revenue_transactions')
          .insert({
            shop_id,
            order_id,
            amount,
            currency: event.data.currency || 'NGN',
            payment_reference: event.data.reference,
            payment_method: 'paystack',
            transaction_type: 'order_payment',
            metadata: {
              customer: event.data.customer,
              channel: event.data.channel,
              paystack_fees: event.data.fees,
            },
          });

        if (revenueError) {
          console.error('Error recording revenue:', revenueError);
        } else {
          console.log('Revenue recorded:', { shop_id, order_id, amount });
        }

        // Update order payment status
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_reference: event.data.reference,
          })
          .eq('id', order_id);

        if (orderError) {
          console.error('Error updating order:', orderError);
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
