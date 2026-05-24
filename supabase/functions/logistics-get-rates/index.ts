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

const SENDBOX_API_KEY = Deno.env.get('SENDBOX_API_KEY');
const SENDBOX_BASE_URL = 'https://live.sendbox.co/shipping';
const ALLOW_MOCK_RATES = Deno.env.get('LOGISTICS_ALLOW_MOCK_RATES') === 'true';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RateRequest = await req.json();
    const { pickup_address, delivery_address, weight_kg = 1 } = body;

    // Optional mock fallback if no API key
    if (!SENDBOX_API_KEY && ALLOW_MOCK_RATES) {
      console.log('Sendbox API key not configured, returning mock rates');
      const basePrice = pickup_address.city === delivery_address.city ? 1500 : 3000;
      return new Response(
        JSON.stringify({
          success: true,
          rates: [
            {
              carrier: 'Sendbox Delivery',
              carrier_logo: 'https://sendbox.co/logo.png',
              price: basePrice,
              currency: 'NGN',
              estimated_days: 2,
              rate_id: 'mock_sb_' + Date.now(),
            }
          ],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!SENDBOX_API_KEY) {
      return new Response(
        JSON.stringify({ success: true, rates: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mapAddress = (addr: DeliveryAddress) => ({
      name: addr.name,
      street: addr.address,
      city: addr.city,
      state: addr.state,
      country: addr.country || 'NG',
      phone: addr.phone
    });

    const quoteRes = await fetch(`${SENDBOX_BASE_URL}/shipment_delivery_quote`, {
      method: 'POST',
      headers: {
        'Authorization': `Sendbox ${SENDBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: mapAddress(pickup_address),
        destination: mapAddress(delivery_address),
        weight: weight_kg,
        channel_code: 'api',
        service_type: 'local',
        incoming_option: 'pickup'
      }),
    });

    if (!quoteRes.ok) {
      const errTxt = await quoteRes.text();
      throw new Error(`Sendbox Quote Error: ${quoteRes.status} ${errTxt}`);
    }

    const quoteData = await quoteRes.json();
    const options = quoteData?.data?.rates || quoteData?.rates || [];
    const parsed = Array.isArray(options)
      ? options.map((option: any, idx: number) => ({
          carrier: option.courier_name || option.name || option.carrier || 'Sendbox Partner',
          carrier_logo: option.logo_url || option.carrier_logo || 'https://sendbox.co/logo.png',
          price: Number(option.fee || option.amount || option.price || 0),
          currency: String(option.currency || 'NGN'),
          estimated_days: Number(option.estimated_days || option.eta_days || 3),
          rate_id: String(option.rate_id || option.id || `sb_rate_${Date.now()}_${idx}`),
        })).filter((r: any) => Number.isFinite(r.price) && r.price > 0)
      : [];

    const rates = parsed.length > 0
      ? parsed
      : [{
          carrier: 'Sendbox',
          carrier_logo: 'https://sendbox.co/logo.png',
          price: Number(quoteData?.fee || quoteData?.data?.fee || 0),
          currency: 'NGN',
          estimated_days: 3,
          rate_id: `sb_rate_${Date.now()}`,
        }].filter((r) => Number.isFinite(r.price) && r.price > 0);

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
