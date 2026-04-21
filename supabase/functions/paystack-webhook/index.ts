import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

const COMMISSION_RATE = 0.1;
const VALID_REFERRAL_STATUSES = ['pending', 'qualified', 'rewarded'];
const REVERSAL_EVENTS = new Set(['refund.processed', 'charge.dispute.create']);

const logInfo = (message: string, context: Record<string, unknown> = {}) => {
  console.log(JSON.stringify({ level: 'info', message, ...context }));
};

const logWarn = (message: string, context: Record<string, unknown> = {}) => {
  console.warn(JSON.stringify({ level: 'warn', message, ...context }));
};

const logError = (message: string, context: Record<string, unknown> = {}) => {
  console.error(JSON.stringify({ level: 'error', message, ...context }));
};

const getPaymentReference = (event: any): string | null => {
  return (
    event?.data?.reference ||
    event?.data?.transaction?.reference ||
    event?.data?.transaction_ref ||
    event?.data?.id?.toString?.() ||
    null
  );
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

    // Verify webhook signature using proper HMAC-SHA512
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(paystackSecretKey),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
    const expectedSignature = Array.from(new Uint8Array(sig))
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
    const paymentReference = getPaymentReference(event);
    logInfo('Received webhook event', { event: event.event, paymentReference });

    // Handle successful charge event
    if (event.event === 'charge.success') {
      const { user_id, order_id, shop_id } = event.data.metadata || {};
      
      logInfo('Processing charge.success', { user_id, order_id, shop_id, paymentReference });

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
            logError('Error updating subscription', { error: updateError, user_id: finalUserId });
          } else {
            logInfo('Subscription updated via webhook', {
              user_id: finalUserId,
              expires_at: newExpiryDate.toISOString(),
              event: event.event,
              is_recurring: !!planCode
            });
          }

          // Award ambassador commission for successful subscription payments
          const amountPaidNgn = Math.round((Number(event.data.amount || 0) / 100) * 100) / 100;
          const commissionAmountNgn = Math.round(amountPaidNgn * COMMISSION_RATE * 100) / 100;

          if (!paymentReference) {
            logWarn('Missing payment reference for commission processing', { user_id: finalUserId });
          } else if (commissionAmountNgn <= 0) {
            logWarn('Skipping commission because computed amount is non-positive', {
              user_id: finalUserId,
              amountPaidNgn,
              commissionAmountNgn,
              paymentReference,
            });
          } else {
            const { data: referral, error: referralError } = await supabase
              .from('referrals')
              .select('id, referrer_id, referred_id, status')
              .eq('referred_id', finalUserId)
              .in('status', VALID_REFERRAL_STATUSES)
              .maybeSingle();

            if (referralError) {
              logError('Failed to resolve referral for commission', {
                user_id: finalUserId,
                paymentReference,
                error: referralError,
              });
            } else if (!referral?.referrer_id) {
              logInfo('No eligible referral found for subscription commission', {
                user_id: finalUserId,
                paymentReference,
              });
            } else {
              const commissionMetadata = {
                paystack_event: event.event,
                channel: event.data.channel,
                currency: event.data.currency || 'NGN',
                amount_kobo: event.data.amount,
                customer_email: customerEmail,
              };

              const { data: commission, error: commissionError } = await supabase
                .from('ambassador_commissions')
                .upsert({
                  referrer_id: referral.referrer_id,
                  referred_user_id: finalUserId,
                  referral_id: referral.id,
                  payment_reference: paymentReference,
                  amount_paid_ngn: amountPaidNgn,
                  commission_amount_ngn: commissionAmountNgn,
                  status: 'awarded',
                  metadata: commissionMetadata,
                }, {
                  onConflict: 'payment_reference,referred_user_id',
                  ignoreDuplicates: true,
                })
                .select('id')
                .maybeSingle();

              if (commissionError) {
                logError('Failed to insert ambassador commission', {
                  paymentReference,
                  referred_user_id: finalUserId,
                  referrer_id: referral.referrer_id,
                  error: commissionError,
                });
              } else {
                const { error: auditLogError } = await supabase.from('activity_logs').insert({
                  user_id: referral.referrer_id,
                  action_type: commission?.id ? 'ambassador_commission_awarded' : 'ambassador_commission_duplicate',
                  resource_type: 'ambassador_commission',
                  resource_id: commission?.id || null,
                  resource_name: paymentReference,
                  details: {
                    referrer_id: referral.referrer_id,
                    referred_user_id: finalUserId,
                    referral_id: referral.id,
                    payment_reference: paymentReference,
                    amount_paid_ngn: amountPaidNgn,
                    commission_amount_ngn: commissionAmountNgn,
                  },
                  metadata: commissionMetadata,
                });
                if (auditLogError) {
                  logError('Failed to write commission audit log', {
                    paymentReference,
                    referred_user_id: finalUserId,
                    error: auditLogError,
                  });
                }

                logInfo('Ambassador commission processed', {
                  outcome: commission?.id ? 'awarded' : 'duplicate_ignored',
                  paymentReference,
                  referred_user_id: finalUserId,
                  referrer_id: referral.referrer_id,
                  amountPaidNgn,
                  commissionAmountNgn,
                });
              }
            }
          }
        } else {
          logError('Could not identify user for subscription charge', {
            email: customerEmail,
            reference: event.data.reference
          });
        }
      }

      // If this is an order payment (has order_id and shop_id) - record revenue with platform fee
      if (order_id && shop_id) {
        const grossAmount = event.data.amount / 100; // Paystack sends amount in kobo
        const feePercentage = 1; // Platform fee percentage (1% via split payments)
        const platformFee = Math.round(grossAmount * (feePercentage / 100) * 100) / 100;
        const netToShop = grossAmount - platformFee;

        // Record revenue transaction with fee breakdown
        const { data: revenueData, error: revenueError } = await supabase
          .from('revenue_transactions')
          .insert({
            shop_id,
            order_id,
            amount: netToShop, // Shop receives net amount
            gross_amount: grossAmount,
            platform_fee_percentage: feePercentage,
            platform_fee: platformFee,
            currency: event.data.currency || 'NGN',
            payment_reference: event.data.reference,
            payment_method: 'paystack',
            transaction_type: 'order_payment',
            metadata: {
              customer: event.data.customer,
              channel: event.data.channel,
              paystack_fees: event.data.fees,
            },
          })
          .select()
          .single();

        if (revenueError) {
          logError('Error recording revenue', { error: revenueError, order_id, shop_id, paymentReference });
        } else {
          logInfo('Revenue recorded with platform fee', { 
            shop_id, 
            order_id, 
            grossAmount, 
            platformFee, 
            netToShop 
          });

          // Record platform earnings
          const { error: earningsError } = await supabase
            .from('platform_earnings')
            .insert({
              transaction_id: revenueData?.id || null,
              shop_id,
              order_id,
              gross_amount: grossAmount,
              fee_percentage: feePercentage,
              fee_amount: platformFee,
              net_to_shop: netToShop,
            });

          if (earningsError) {
            logError('Error recording platform earnings', { error: earningsError, order_id, shop_id, paymentReference });
          }
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
          logError('Error updating order', { error: orderError, order_id, paymentReference });
        }
      }
    }

    if (REVERSAL_EVENTS.has(event.event)) {
      if (!paymentReference) {
        logWarn('Skipping commission reversal due to missing payment reference', { event: event.event });
      } else {
        const { data: existingCommission, error: fetchError } = await supabase
          .from('ambassador_commissions')
          .select('id, referrer_id, referred_user_id, payment_reference, status, metadata')
          .eq('payment_reference', paymentReference)
          .neq('status', 'reversed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          logError('Failed to resolve commission for reversal', { paymentReference, event: event.event, error: fetchError });
        } else if (!existingCommission) {
          logInfo('No commission found to reverse', { paymentReference, event: event.event });
        } else {
          const reversalMetadata = {
            reversal_event: event.event,
            paystack_payload_id: event?.data?.id ?? null,
            happened_at: new Date().toISOString(),
          };

          const { error: reverseError } = await supabase
            .from('ambassador_commissions')
            .update({
              status: 'reversed',
              reversed_at: new Date().toISOString(),
              reversal_reason: event.event,
              metadata: {
                ...(existingCommission.metadata || {}),
                reversal: reversalMetadata,
              },
            })
            .eq('id', existingCommission.id);

          if (reverseError) {
            logError('Failed to reverse ambassador commission', {
              commission_id: existingCommission.id,
              paymentReference,
              error: reverseError,
            });
          } else {
            const { error: reversalAuditError } = await supabase.from('activity_logs').insert({
              user_id: existingCommission.referrer_id,
              action_type: 'ambassador_commission_reversed',
              resource_type: 'ambassador_commission',
              resource_id: existingCommission.id,
              resource_name: existingCommission.payment_reference,
              details: {
                payment_reference: existingCommission.payment_reference,
                referred_user_id: existingCommission.referred_user_id,
                reversal_event: event.event,
              },
              metadata: reversalMetadata,
            });
            if (reversalAuditError) {
              logError('Failed to write commission reversal audit log', {
                commission_id: existingCommission.id,
                paymentReference,
                error: reversalAuditError,
              });
            }

            logInfo('Ambassador commission reversed', {
              commission_id: existingCommission.id,
              paymentReference,
              event: event.event,
            });
          }
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
    logError('Webhook error', { error });
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
