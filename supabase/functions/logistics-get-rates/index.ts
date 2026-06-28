import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeliveryAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  email?: string;
}

interface RateRequest {
  order_id: string;
  pickup_address: DeliveryAddress;
  delivery_address: DeliveryAddress;
  weight_kg?: number;
  dimensions?: { length: number; width: number; height: number };
  package_items?: Array<{
    name: string;
    description?: string;
    unit_weight: number;
    unit_amount?: number;
    quantity: number;
  }>;
}

const TERMINAL_API_KEY = Deno.env.get("TERMINAL_API_KEY");
const TERMINAL_BASE_URL = "https://api.terminal.africa/v1";
const SENDBOX_API_KEY = Deno.env.get("SENDBOX_API_KEY");
const SENDBOX_BASE_URL = "https://live.sendbox.co/shipping";
const SHIPBUBBLE_API_KEY = Deno.env.get("SHIPBUBBLE_API_KEY");
const SHIPBUBBLE_BASE_URL = "https://api.shipbubble.com/v1";
const SHIPBUBBLE_DEFAULT_CATEGORY_ID = 3035980; // Electronics as default

/**
 * Get delivery rates from Terminal Africa
 */
async function getTerminalRates(
  pickup: DeliveryAddress,
  delivery: DeliveryAddress,
  weight: number,
  dimensions?: { length: number; width: number; height: number },
): Promise<any[]> {
  if (!TERMINAL_API_KEY) {
    console.log("Terminal API key not configured");
    return [];
  }

  const formatAddress = (addr: DeliveryAddress) => ({
    name: addr.name,
    phone: addr.phone,
    address_line_1: addr.address,
    city: addr.city,
    state: addr.state,
    country: addr.country || "NG",
  });

  try {
    const response = await fetch(`${TERMINAL_BASE_URL}/rates/quote`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TERMINAL_API_KEY}`,
        "Content-Type": "application/json",
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
      console.error("Terminal quote error:", response.status, error);
      return [];
    }

    const data = await response.json();
    const rates = data?.data || [];

    return rates
      .map((rate: any) => ({
        carrier: rate.name || rate.carrier_name || "Carrier",
        carrier_logo: rate.logo || rate.carrier_logo || "",
        price: Number(rate.price || rate.fee || 0),
        currency: "NGN",
        estimated_days: Number(rate.estimated_days || rate.eta || 3),
        rate_id:
          rate.rate_id ||
          rate.id ||
          `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        service_type: rate.service_type || "standard",
        provider: "terminal",
      }))
      .filter((r: any) => Number.isFinite(r.price) && r.price > 0);
  } catch (error) {
    console.error("Terminal rates fetch error:", error);
    return [];
  }
}

/**
 * Get delivery rates from Sendbox (secondary provider)
 */
async function getSendboxRates(
  pickup: DeliveryAddress,
  delivery: DeliveryAddress,
  weight: number,
): Promise<any[]> {
  if (!SENDBOX_API_KEY) {
    return [];
  }

  const formatAddress = (addr: DeliveryAddress) => ({
    name: addr.name,
    street: addr.address,
    city: addr.city,
    state: addr.state,
    country: addr.country || "NG",
    phone: addr.phone,
  });

  try {
    const response = await fetch(
      `${SENDBOX_BASE_URL}/shipment_delivery_quote`,
      {
        method: "POST",
        headers: {
          Authorization: `Sendbox ${SENDBOX_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: formatAddress(pickup),
          destination: formatAddress(delivery),
          weight: weight,
          channel_code: "api",
          service_type: "local",
          incoming_option: "pickup",
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Sendbox quote error:", response.status, error);
      return [];
    }

    const data = await response.json();
    const options = data?.data?.rates || data?.rates || [];

    return options
      .map((option: any, idx: number) => ({
        carrier:
          option.courier_name ||
          option.name ||
          option.carrier ||
          "Sendbox Partner",
        carrier_logo: option.logo_url || "https://sendbox.co/logo.png",
        price: Number(option.fee || option.amount || option.price || 0),
        currency: "NGN",
        estimated_days: Number(option.estimated_days || option.eta_days || 3),
        rate_id: option.rate_id || option.id || `sb_${Date.now()}_${idx}`,
        service_type: "standard",
        provider: "sendbox",
      }))
      .filter((r: any) => Number.isFinite(r.price) && r.price > 0);
  } catch (error) {
    console.error("Sendbox rates fetch error:", error);
    return [];
  }
}

/**
 * Validate address with Shipbubble
 */
async function validateShipbubbleAddress(
  address: DeliveryAddress,
): Promise<{ address_code: number } | null> {
  if (!SHIPBUBBLE_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `${SHIPBUBBLE_BASE_URL}/shipping/address/validate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SHIPBUBBLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: address.name,
          email: address.email || "noreply@example.com",
          phone: address.phone,
          address: `${address.address}, ${address.city}, ${address.state}`,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(
        "Shipbubble address validation error:",
        response.status,
        error,
      );
      return null;
    }

    const data = await response.json();
    if (data.status === "success") {
      return { address_code: data.data.address_code };
    }
    return null;
  } catch (error) {
    console.error("Shipbubble address validation error:", error);
    return null;
  }
}

/**
 * Get delivery rates from Shipbubble
 */
async function getShipbubbleRates(
  pickup: DeliveryAddress,
  delivery: DeliveryAddress,
  weight: number,
  dimensions?: { length: number; width: number; height: number },
  package_items?: Array<{
    name: string;
    description?: string;
    unit_weight: number;
    unit_amount?: number;
    quantity: number;
  }>,
): Promise<any[]> {
  if (!SHIPBUBBLE_API_KEY) {
    console.log("Shipbubble API key not configured");
    return [];
  }

  try {
    // First validate both addresses
    const pickupValidated = await validateShipbubbleAddress(pickup);
    const deliveryValidated = await validateShipbubbleAddress(delivery);

    if (!pickupValidated || !deliveryValidated) {
      console.error("Shipbubble address validation failed");
      return [];
    }

    // Prepare package items (default to a single item if none provided)
    const items =
      package_items && package_items.length > 0
        ? package_items
        : [
            {
              name: "Package",
              description: "Delivery package",
              unit_weight: weight,
              unit_amount: 0,
              quantity: 1,
            },
          ];

    // Calculate pickup date (tomorrow by default)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const pickupDate = tomorrow.toISOString().split("T")[0];

    const response = await fetch(
      `${SHIPBUBBLE_BASE_URL}/shipping/fetch_rates`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SHIPBUBBLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_address_code: pickupValidated.address_code,
          reciever_address_code: deliveryValidated.address_code,
          pickup_date: pickupDate,
          category_id: SHIPBUBBLE_DEFAULT_CATEGORY_ID,
          package_items: items,
          package_dimension: dimensions || {
            length: 20,
            width: 15,
            height: 10,
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Shipbubble quote error:", response.status, error);
      return [];
    }

    const data = await response.json();
    if (data.status !== "success") {
      console.error("Shipbubble quote failed:", data.message);
      return [];
    }

    const couriers = data.data?.couriers || [];

    return couriers
      .map((courier: any) => ({
        carrier: courier.courier_name || "Shipbubble Courier",
        carrier_logo: courier.courier_image || "",
        price: Number(courier.total || courier.rate_card_amount || 0),
        currency: courier.currency || "NGN",
        estimated_days: 3, // Default if not provided
        rate_id: `${data.data.request_token}|${courier.service_code}|${courier.courier_id}`,
        service_type: courier.service_type || "standard",
        provider: "shipbubble",
        request_token: data.data.request_token,
        service_code: courier.service_code,
        courier_id: courier.courier_id,
      }))
      .filter((r: any) => Number.isFinite(r.price) && r.price > 0);
  } catch (error) {
    console.error("Shipbubble rates fetch error:", error);
    return [];
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RateRequest = await req.json();
    const {
      pickup_address,
      delivery_address,
      weight_kg = 1,
      dimensions,
      package_items,
    } = body;

    // Validate addresses
    if (!pickup_address?.city || !delivery_address?.city) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "City is required for both pickup and delivery",
          rates: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const allRates: any[] = [];

    // Try Shipbubble first if configured
    if (SHIPBUBBLE_API_KEY) {
      const shipbubbleRates = await getShipbubbleRates(
        pickup_address,
        delivery_address,
        weight_kg,
        dimensions,
        package_items,
      );
      allRates.push(...shipbubbleRates);
    }

    // Then try Terminal
    if (TERMINAL_API_KEY) {
      const terminalRates = await getTerminalRates(
        pickup_address,
        delivery_address,
        weight_kg,
        dimensions,
      );
      allRates.push(...terminalRates);
    }

    // Then try Sendbox
    if (SENDBOX_API_KEY) {
      const sendboxRates = await getSendboxRates(
        pickup_address,
        delivery_address,
        weight_kg,
      );
      allRates.push(...sendboxRates);
    }

    if (allRates.length > 0) {
      return new Response(JSON.stringify({ success: true, rates: allRates }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No providers configured or all returned nothing
    const configuredProviders = [];
    if (SHIPBUBBLE_API_KEY) configuredProviders.push("Shipbubble");
    if (TERMINAL_API_KEY) configuredProviders.push("Terminal Africa");
    if (SENDBOX_API_KEY) configuredProviders.push("Sendbox");

    return new Response(
      JSON.stringify({
        success: true,
        rates: [],
        message:
          configuredProviders.length === 0
            ? "No logistics provider configured"
            : "No rates available for this route from configured providers",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error getting rates:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        rates: [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
