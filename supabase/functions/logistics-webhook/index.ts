import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-terminal-signature',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Status mapping from Terminal Africa to our statuses
const STATUS_MAP: Record<string, string> = {
  'pending': 'pending',
  'confirmed': 'confirmed',
  'picked-up': 'picked_up',
  'in-transit': 'in_transit',
  'out-for-delivery': 'out_for_delivery',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'failed': 'failed',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle Terminal Africa webhook format
    const event = body.event || body.type;
    const data = body.data || body;

    if (!data.shipment_id && !data.metadata?.order_id) {
      console.log('No shipment_id or order_id in webhook, skipping');
      return new Response(
        JSON.stringify({ success: true, message: 'Webhook received' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find delivery order by provider_shipment_id or order_id
    let deliveryOrder;
    
    if (data.shipment_id) {
      const { data: order } = await supabase
        .from('delivery_orders')
        .select('*')
        .eq('provider_shipment_id', data.shipment_id)
        .single();
      deliveryOrder = order;
    }

    if (!deliveryOrder && data.metadata?.order_id) {
      const { data: order } = await supabase
        .from('delivery_orders')
        .select('*')
        .eq('order_id', data.metadata.order_id)
        .single();
      deliveryOrder = order;
    }

    if (!deliveryOrder) {
      console.log('Delivery order not found for webhook');
      return new Response(
        JSON.stringify({ success: true, message: 'Delivery order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map status
    const rawStatus = data.status || event?.replace('shipment.', '');
    const mappedStatus = STATUS_MAP[rawStatus] || rawStatus;

    // Update delivery order status
    const updates: Record<string, any> = { status: mappedStatus };
    
    if (mappedStatus === 'picked_up') updates.picked_up_at = new Date().toISOString();
    if (mappedStatus === 'delivered') updates.delivered_at = new Date().toISOString();
    if (mappedStatus === 'cancelled') updates.cancelled_at = new Date().toISOString();

    if (data.tracking_number && !deliveryOrder.provider_tracking_code) {
      updates.provider_tracking_code = data.tracking_number;
    }

    await supabase
      .from('delivery_orders')
      .update(updates)
      .eq('id', deliveryOrder.id);

    // Create tracking event
    await supabase.from('delivery_tracking_events').insert({
      delivery_order_id: deliveryOrder.id,
      status: mappedStatus,
      description: data.description || `Status updated to ${mappedStatus}`,
      location: data.location || null,
      provider_event_id: data.event_id || null,
    });

    // Update related order status if delivery is completed
    if (mappedStatus === 'delivered') {
      await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', deliveryOrder.order_id);
    }

    if (mappedStatus === 'out_for_delivery') {
      await supabase
        .from('orders')
        .update({
          status: 'out_for_delivery',
          out_for_delivery_at: new Date().toISOString(),
        })
        .eq('id', deliveryOrder.order_id);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 200, // Return 200 to prevent webhook retries
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
