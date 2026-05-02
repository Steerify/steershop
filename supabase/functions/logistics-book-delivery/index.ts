import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeliveryAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country?: string;
}

interface BookDeliveryRequest {
  order_id: string;
  shop_id: string;
  rate_id?: string;
  provider: 'terminal' | 'sendbox' | 'manual';
  pickup_address: DeliveryAddress;
  delivery_address: DeliveryAddress;
  delivery_fee: number;
  weight_kg?: number;
  dimensions?: { length: number; width: number; height: number };
}

const SENDBOX_API_KEY = Deno.env.get('SENDBOX_API_KEY');
const SENDBOX_BASE_URL = 'https://live.sendbox.co/shipping';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // SECURITY: require an authenticated caller and verify shop ownership.
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

    const body: BookDeliveryRequest = await req.json();
    const { order_id, shop_id, rate_id, provider, pickup_address, delivery_address, delivery_fee, weight_kg, dimensions } = body;

    // Verify the caller owns the shop they're booking for.
    const { data: shopRow, error: shopLookupErr } = await supabase
      .from('shops')
      .select('owner_id')
      .eq('id', shop_id)
      .maybeSingle();
    if (shopLookupErr || !shopRow || shopRow.owner_id !== authData.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let providerShipmentId = null;
    let providerTrackingCode = null;
    let estimatedDeliveryDate = null;

    if (provider === 'sendbox' && SENDBOX_API_KEY) {
      const mapAddress = (addr: DeliveryAddress) => ({
        name: addr.name,
        street: addr.address,
        city: addr.city,
        state: addr.state,
        country: addr.country || 'NG',
        phone: addr.phone
      });

      const payload = {
        origin: mapAddress(pickup_address),
        destination: mapAddress(delivery_address),
        weight: weight_kg || 1,
        channel_code: 'api',
        service_type: 'local'
      };

      const shipmentRes = await fetch(`${SENDBOX_BASE_URL}/shipments`, {
        method: 'POST',
        headers: {
          'Authorization': `Sendbox ${SENDBOX_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const shipmentData = await shipmentRes.json();
      if (shipmentData.data) {
        providerShipmentId = shipmentData.data.code || shipmentData.data.tracking_code;
        providerTrackingCode = shipmentData.data.tracking_code || shipmentData.data.code;
        estimatedDeliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    // Create delivery order in database
    const { data: deliveryOrder, error: insertError } = await supabase
      .from('delivery_orders')
      .insert({
        order_id,
        shop_id,
        provider,
        provider_shipment_id: providerShipmentId,
        provider_tracking_code: providerTrackingCode,
        pickup_address,
        delivery_address,
        delivery_fee,
        weight_kg: weight_kg || null,
        dimensions: dimensions || null,
        status: providerShipmentId ? 'confirmed' : 'pending',
        estimated_delivery_date: estimatedDeliveryDate,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Create initial tracking event
    await supabase.from('delivery_tracking_events').insert({
      delivery_order_id: deliveryOrder.id,
      status: 'confirmed',
      description: provider === 'manual' 
        ? 'Delivery booked manually' 
        : `Delivery booked with ${provider}`,
    });

    // Update order status to processing if it was confirmed
    await supabase
      .from('orders')
      .update({ 
        status: 'processing',
        processing_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .eq('status', 'confirmed');

    return new Response(
      JSON.stringify({
        success: true,
        delivery_order_id: deliveryOrder.id,
        tracking_code: providerTrackingCode,
        estimated_delivery: estimatedDeliveryDate,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error booking delivery:', error);
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
