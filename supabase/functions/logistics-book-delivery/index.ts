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
    const body: BookDeliveryRequest = await req.json();
    const { order_id, shop_id, rate_id, provider, pickup_address, delivery_address, delivery_fee, weight_kg, dimensions } = body;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let providerShipmentId = null;
    let providerTrackingCode = null;
    let estimatedDeliveryDate = null;

    // For Terminal Africa provider with API key configured
    if (provider === 'terminal' && TERMINAL_API_KEY && rate_id) {
      // Step 1: Create pickup address
      const pickupRes = await fetch(`${TERMINAL_BASE_URL}/addresses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TERMINAL_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: pickup_address.name.split(' ')[0],
          last_name: pickup_address.name.split(' ').slice(1).join(' ') || pickup_address.name,
          phone: pickup_address.phone, line1: pickup_address.address,
          city: pickup_address.city, state: pickup_address.state, country: pickup_address.country || 'NG', is_residential: false,
        }),
      });
      const pickupData = await pickupRes.json();

      // Step 2: Create delivery address
      const deliveryRes = await fetch(`${TERMINAL_BASE_URL}/addresses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TERMINAL_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: delivery_address.name.split(' ')[0],
          last_name: delivery_address.name.split(' ').slice(1).join(' ') || delivery_address.name,
          phone: delivery_address.phone, line1: delivery_address.address,
          city: delivery_address.city, state: delivery_address.state, country: delivery_address.country || 'NG', is_residential: true,
        }),
      });
      const deliveryData = await deliveryRes.json();

      // Step 3: Create parcel
      const parcelRes = await fetch(`${TERMINAL_BASE_URL}/parcels`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TERMINAL_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: weight_kg || 1, weight_unit: 'kg',
          length: dimensions?.length || 20, width: dimensions?.width || 15, height: dimensions?.height || 10,
          dimension_unit: 'cm', packaging: 'box', description: 'SteerSolo order package',
        }),
      });
      const parcelData = await parcelRes.json();

      // Step 4: Create shipment with full payload
      const shipmentRes = await fetch(`${TERMINAL_BASE_URL}/shipments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TERMINAL_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate_id,
          address_from: pickupData.data?.id,
          address_to: deliveryData.data?.id,
          parcel: parcelData.data?.id,
          metadata: { order_id, shop_id },
        }),
      });
      const shipmentData = await shipmentRes.json();

      if (shipmentData.data) {
        providerShipmentId = shipmentData.data.id;
        providerTrackingCode = shipmentData.data.tracking_number;
        if (shipmentData.data.estimated_delivery_date) {
          estimatedDeliveryDate = shipmentData.data.estimated_delivery_date;
        }

        // Step 5: Arrange pickup (dispatch the shipment)
        try {
          await fetch(`${TERMINAL_BASE_URL}/shipments/${shipmentData.data.id}/arrange-pickup`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${TERMINAL_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
        } catch (pickupErr) {
          console.error('Arrange pickup failed (non-fatal):', pickupErr);
        }
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
