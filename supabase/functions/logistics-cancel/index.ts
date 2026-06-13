import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TERMINAL_API_KEY = Deno.env.get('TERMINAL_API_KEY');
const TERMINAL_BASE_URL = 'https://api.terminal.africa/v1';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CancelRequest {
  delivery_order_id: string;
  reason?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: authData, error: authErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authErr || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: CancelRequest = await req.json();
    const { delivery_order_id, reason } = body;

    if (!delivery_order_id) {
      return new Response(JSON.stringify({ error: 'delivery_order_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get delivery order and verify ownership
    const { data: deliveryOrder, error: fetchError } = await supabase
      .from('delivery_orders')
      .select(`
        *,
        shops!delivery_orders_shop_id_fkey (
          owner_id
        )
      `)
      .eq('id', delivery_order_id)
      .single();

    if (fetchError || !deliveryOrder) {
      return new Response(JSON.stringify({ error: 'Delivery order not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify ownership
    const shop = deliveryOrder.shops as any;
    if (shop?.owner_id !== authData.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if cancellation is allowed
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(deliveryOrder.status)) {
      return new Response(JSON.stringify({ 
        error: `Cannot cancel delivery in '${deliveryOrder.status}' status. Only 'pending' and 'confirmed' orders can be cancelled.`,
        can_cancel: false,
        current_status: deliveryOrder.status,
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check 1-hour rule for confirmed orders (if already picked up, cannot cancel)
    if (deliveryOrder.status === 'confirmed' && deliveryOrder.picked_up_at) {
      const pickedUpAt = new Date(deliveryOrder.picked_up_at);
      const now = new Date();
      const hoursSincePickup = (now.getTime() - pickedUpAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSincePickup >= 1) {
        return new Response(JSON.stringify({ 
          error: 'Cannot cancel after 1 hour of pickup. Please contact support.',
          can_cancel: false,
          hours_since_pickup: hoursSincePickup,
        }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    let terminalCancelSuccess = false;

    // Attempt to cancel with Terminal Africa if provider is terminal
    if (deliveryOrder.provider === 'terminal' && deliveryOrder.provider_shipment_id && TERMINAL_API_KEY) {
      try {
        const cancelResponse = await fetch(
          `${TERMINAL_BASE_URL}/shipments/${deliveryOrder.provider_shipment_id}/cancel`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${TERMINAL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              reason: reason || 'Customer/vendor cancellation',
            }),
          }
        );

        if (cancelResponse.ok) {
          terminalCancelSuccess = true;
        } else {
          const errorText = await cancelResponse.text();
          console.warn('Terminal cancel API warning:', cancelResponse.status, errorText);
          // Continue with local cancellation even if Terminal API fails
        }
      } catch (error) {
        console.error('Terminal cancel error:', error);
        // Continue with local cancellation
      }
    }

    // Update delivery order status
    const cancelReason = reason || 'Cancelled by vendor';
    const { error: updateError } = await supabase
      .from('delivery_orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        metadata: {
          ...(deliveryOrder.metadata || {}),
          cancelled_by: authData.user.id,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancelReason,
          terminal_cancelled: terminalCancelSuccess,
        },
      })
      .eq('id', delivery_order_id);

    if (updateError) {
      throw updateError;
    }

    // Create tracking event
    await supabase.from('delivery_tracking_events').insert({
      delivery_order_id,
      status: 'cancelled',
      description: `Delivery cancelled: ${cancelReason}`,
      location: null,
      notify_vendor: true,
      notify_customer: true,
      notification_sent_at: new Date().toISOString(),
    });

    // Update related order status
    await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', deliveryOrder.order_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Delivery cancelled successfully',
        terminal_cancelled: terminalCancelSuccess,
        refund_eligible: deliveryOrder.status === 'pending' || 
          (deliveryOrder.status === 'confirmed' && !deliveryOrder.picked_up_at),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error cancelling delivery:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
