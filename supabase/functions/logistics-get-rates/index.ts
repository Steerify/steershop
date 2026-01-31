import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

interface RateRequest {
  order_id: string;
  pickup_address: DeliveryAddress;
  delivery_address: DeliveryAddress;
  weight_kg?: number;
}

const TERMINAL_API_KEY = Deno.env.get('TERMINAL_API_KEY');
const TERMINAL_BASE_URL = 'https://api.terminal.africa/v1';

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RateRequest = await req.json();
    const { pickup_address, delivery_address, weight_kg = 1 } = body;

    // If Terminal API key is not configured, return mock rates for testing
    if (!TERMINAL_API_KEY) {
      console.log('Terminal API key not configured, returning mock rates');
      
      // Calculate mock prices based on cities
      const basePrice = pickup_address.city === delivery_address.city ? 1500 : 3000;
      
      return new Response(
        JSON.stringify({
          success: true,
          rates: [
            {
              carrier: 'GIG Logistics',
              carrier_logo: 'https://terminal.africa/carriers/gig.png',
              price: basePrice,
              currency: 'NGN',
              estimated_days: 2,
              rate_id: 'mock_gig_' + Date.now(),
            },
            {
              carrier: 'DHL Express',
              carrier_logo: 'https://terminal.africa/carriers/dhl.png',
              price: basePrice * 1.5,
              currency: 'NGN',
              estimated_days: 1,
              rate_id: 'mock_dhl_' + Date.now(),
            },
            {
              carrier: 'Kobo360',
              carrier_logo: 'https://terminal.africa/carriers/kobo.png',
              price: basePrice * 0.8,
              currency: 'NGN',
              estimated_days: 3,
              rate_id: 'mock_kobo_' + Date.now(),
            },
          ],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create addresses in Terminal Africa
    const pickupAddressRes = await fetch(`${TERMINAL_BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TERMINAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: pickup_address.name.split(' ')[0],
        last_name: pickup_address.name.split(' ').slice(1).join(' ') || pickup_address.name,
        phone: pickup_address.phone,
        line1: pickup_address.address,
        city: pickup_address.city,
        state: pickup_address.state,
        country: 'NG',
        is_residential: false,
      }),
    });

    const pickupData = await pickupAddressRes.json();
    if (!pickupData.data?.id) {
      throw new Error('Failed to create pickup address');
    }

    const deliveryAddressRes = await fetch(`${TERMINAL_BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TERMINAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: delivery_address.name.split(' ')[0],
        last_name: delivery_address.name.split(' ').slice(1).join(' ') || delivery_address.name,
        phone: delivery_address.phone,
        line1: delivery_address.address,
        city: delivery_address.city,
        state: delivery_address.state,
        country: 'NG',
        is_residential: true,
      }),
    });

    const deliveryData = await deliveryAddressRes.json();
    if (!deliveryData.data?.id) {
      throw new Error('Failed to create delivery address');
    }

    // Create parcel
    const parcelRes = await fetch(`${TERMINAL_BASE_URL}/parcels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TERMINAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weight: weight_kg,
        weight_unit: 'kg',
        length: 20,
        width: 15,
        height: 10,
        dimension_unit: 'cm',
        packaging: 'box',
        description: 'SteerSolo order package',
      }),
    });

    const parcelData = await parcelRes.json();
    if (!parcelData.data?.id) {
      throw new Error('Failed to create parcel');
    }

    // Get shipping rates
    const ratesRes = await fetch(`${TERMINAL_BASE_URL}/rates/shipment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TERMINAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pickup_address: pickupData.data.id,
        delivery_address: deliveryData.data.id,
        parcel_id: parcelData.data.id,
        currency: 'NGN',
      }),
    });

    const ratesData = await ratesRes.json();

    const rates = (ratesData.data || []).map((rate: any) => ({
      carrier: rate.carrier_name,
      carrier_logo: rate.carrier_logo,
      price: rate.amount,
      currency: 'NGN',
      estimated_days: rate.estimated_delivery_days || 3,
      rate_id: rate.rate_id,
    }));

    return new Response(
      JSON.stringify({ success: true, rates }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error getting rates:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        rates: [], // Return empty rates, UI will show manual option
      }),
      { 
        status: 200, // Return 200 so UI can handle gracefully
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
