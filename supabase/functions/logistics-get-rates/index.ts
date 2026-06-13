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

interface RateRequest {
  order_id: string;
  pickup_address: DeliveryAddress;
  delivery_address: DeliveryAddress;
  weight_kg?: number;
  dimensions?: { length: number; width: number; height: number };
}

const TERMINAL_API_KEY = Deno.env.get('TERMINAL_API_KEY');
const TERMINAL_BASE_URL = 'https://api.terminal.africa/v1';
const SENDBOX_API_KEY = Deno.env.get('SENDBOX_API_KEY');
const SENDBOX_BASE_URL = 'https://live.sendbox.co/shipping';

/**
 * Get delivery rates from Terminal Africa
 */
async function getTerminalRates(
  pickup: DeliveryAddress,
  delivery: DeliveryAddress,
  weight: number,
  dimensions?: { length: number; width: number; height: number }
): Promise<any[]> {
  if (!TERMINAL_API_KEY) {
    console.log('Terminal API key not configured');
    return [];
  }

  const formatAddress = (addr: DeliveryAddress) => ({
    name: addr.name,
    phone: addr.phone,
    address_line_1: addr.address,
    city: addr.city,
    state: addr.state,
    country: addr.country || 'NG',
  });

  try {
    const response = await fetch(`${TERMINAL_BASE_URL}/rates/quote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TERMINAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: formatAddress(pickup),
        destination: formatAddress(delivery),
        weight: weight,
        dimensions: dimensions || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Terminal quote error:', response.status, error);
      return [];
    }

    const data = await response.json();
    const rates = data?.data || [];

    return rates.map((rate: any) => ({
      carrier: rate.name || rate.carrier_name || 'Carrier',
      carrier_logo: rate.logo || rate.carrier_logo || '',
      price: Number(rate.price || rate.fee || 0),
      currency: 'NGN',
      estimated_days: Number(rate.estimated_days || rate.eta || 3),
      rate_id: rate.rate_id || rate.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      service_type: rate.service_type || 'standard',
      provider: 'terminal',
    })).filter((r: any) => Number.isFinite(r.price) && r.price > 0);

  } catch (error) {
    console.error('Terminal rates fetch error:', error);
    return [];
  }
}

/**
 * Get delivery rates from Sendbox (secondary provider)
 */
async function getSendboxRates(
  pickup: DeliveryAddress,
  delivery: DeliveryAddress,
  weight: number
): Promise<any[]> {
  if (!SENDBOX_API_KEY) {
    return [];
  }

  const formatAddress = (addr: DeliveryAddress) => ({
    name: addr.name,
    street: addr.address,
    city: addr.city,
    state: addr.state,
    country: addr.country || 'NG',
    phone: addr.phone
  });

  try {
    const response = await fetch(`${SENDBOX_BASE_URL}/shipment_delivery_quote`, {
      method: 'POST',
      headers: {
        'Authorization': `Sendbox ${SENDBOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: formatAddress(pickup),
        destination: formatAddress(delivery),
        weight: weight,
        channel_code: 'api',
        service_type: 'local',
        incoming_option: 'pickup'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Sendbox quote error:', response.status, error);
      return [];
    }

    const data = await response.json();
    const options = data?.data?.rates || data?.rates || [];

    return options.map((option: any, idx: number) => ({
      carrier: option.courier_name || option.name || option.carrier || 'Sendbox Partner',
      carrier_logo: option.logo_url || 'https://sendbox.co/logo.png',
      price: Number(option.fee || option.amount || option.price || 0),
      currency: 'NGN',
      estimated_days: Number(option.estimated_days || option.eta_days || 3),
      rate_id: option.rate_id || option.id || `sb_${Date.now()}_${idx}`,
      service_type: 'standard',
      provider: 'sendbox',
    })).filter((r: any) => Number.isFinite(r.price) && r.price > 0);

  } catch (error) {
    console.error('Sendbox rates fetch error:', error);
    return [];
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RateRequest = await req.json();
    const { pickup_address, delivery_address, weight_kg = 1, dimensions } = body;

    // Validate addresses
    if (!pickup_address?.city || !delivery_address?.city) {
      return new Response(
        JSON.stringify({ success: false, error: 'City is required for both pickup and delivery', rates: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If Terminal API key is available, use it primarily
    if (TERMINAL_API_KEY) {
      const terminalRates = await getTerminalRates(pickup_address, delivery_address, weight_kg, dimensions);
      
      if (terminalRates.length > 0) {
        return new Response(
          JSON.stringify({ success: true, rates: terminalRates, provider: 'terminal' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fall back to Sendbox if Terminal returns nothing
    if (SENDBOX_API_KEY) {
      const sendboxRates = await getSendboxRates(pickup_address, delivery_address, weight_kg);
      
      if (sendboxRates.length > 0) {
        return new Response(
          JSON.stringify({ success: true, rates: sendboxRates, provider: 'sendbox' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // No providers configured or both returned empty
    return new Response(
      JSON.stringify({ 
        success: true, 
        rates: [], 
        message: !TERMINAL_API_KEY && !SENDBOX_API_KEY 
          ? 'No logistics provider configured' 
          : 'No rates available for this route' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error getting rates:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        rates: [],
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
