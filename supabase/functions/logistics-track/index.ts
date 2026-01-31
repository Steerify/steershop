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

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const deliveryOrderId = url.searchParams.get('delivery_order_id');

    if (!deliveryOrderId) {
      throw new Error('delivery_order_id is required');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get delivery order
    const { data: deliveryOrder, error: fetchError } = await supabase
      .from('delivery_orders')
      .select('*')
      .eq('id', deliveryOrderId)
      .single();

    if (fetchError || !deliveryOrder) {
      throw new Error('Delivery order not found');
    }

    // Get tracking events from our database
    const { data: localEvents } = await supabase
      .from('delivery_tracking_events')
      .select('*')
      .eq('delivery_order_id', deliveryOrderId)
      .order('created_at', { ascending: false });

    // If using Terminal Africa and we have a shipment ID, fetch latest tracking
    if (deliveryOrder.provider === 'terminal' && deliveryOrder.provider_shipment_id && TERMINAL_API_KEY) {
      try {
        const trackingRes = await fetch(
          `${TERMINAL_BASE_URL}/shipments/${deliveryOrder.provider_shipment_id}/tracking`,
          {
            headers: {
              'Authorization': `Bearer ${TERMINAL_API_KEY}`,
            },
          }
        );

        const trackingData = await trackingRes.json();

        if (trackingData.data?.events) {
          // Sync new events to our database
          for (const event of trackingData.data.events) {
            // Check if event already exists
            const existingEvent = localEvents?.find(
              (e: any) => e.provider_event_id === event.id
            );

            if (!existingEvent) {
              await supabase.from('delivery_tracking_events').insert({
                delivery_order_id: deliveryOrderId,
                status: event.status,
                description: event.description,
                location: event.location,
                provider_event_id: event.id,
              });
            }
          }

          // Update delivery order status if changed
          const latestStatus = trackingData.data.status;
          if (latestStatus && latestStatus !== deliveryOrder.status) {
            const updates: Record<string, any> = { status: latestStatus };
            
            if (latestStatus === 'picked_up') updates.picked_up_at = new Date().toISOString();
            if (latestStatus === 'delivered') updates.delivered_at = new Date().toISOString();
            
            await supabase
              .from('delivery_orders')
              .update(updates)
              .eq('id', deliveryOrderId);
          }
        }
      } catch (error) {
        console.error('Error fetching tracking from Terminal:', error);
        // Continue with local events if API fails
      }
    }

    // Fetch updated events
    const { data: updatedEvents } = await supabase
      .from('delivery_tracking_events')
      .select('*')
      .eq('delivery_order_id', deliveryOrderId)
      .order('created_at', { ascending: false });

    // Get updated delivery order
    const { data: updatedOrder } = await supabase
      .from('delivery_orders')
      .select('*')
      .eq('id', deliveryOrderId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        delivery_order: updatedOrder,
        events: updatedEvents || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error tracking delivery:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
