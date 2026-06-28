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

interface BookDeliveryRequest {
  order_id: string;
  shop_id: string;
  rate_id?: string;
  provider: "terminal" | "sendbox" | "manual" | "shipbubble";
  pickup_address: DeliveryAddress;
  delivery_address: DeliveryAddress;
  delivery_fee: number;
  weight_kg?: number;
  dimensions?: { length: number; width: number; height: number };
  is_cod?: boolean;
  carrier_name?: string;
  carrier_logo?: string;
  metadata?: Record<string, any>;
}

const TERMINAL_API_KEY = Deno.env.get("TERMINAL_API_KEY");
const TERMINAL_BASE_URL = "https://api.terminal.africa/v1";
const SENDBOX_API_KEY = Deno.env.get("SENDBOX_API_KEY");
const SENDBOX_BASE_URL = "https://live.sendbox.co/shipping";
const SHIPBUBBLE_API_KEY = Deno.env.get("SHIPBUBBLE_API_KEY");
const SHIPBUBBLE_BASE_URL = "https://api.shipbubble.com/v1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface BookingResult {
  success: boolean;
  shipment_id?: string;
  tracking_code?: string;
  label_url?: string;
  error?: string;
}

async function bookTerminalDelivery(
  pickup: DeliveryAddress,
  delivery: DeliveryAddress,
  rateId: string,
  isCod: boolean,
  codAmount: number,
  metadata: Record<string, any>,
): Promise<BookingResult> {
  if (!TERMINAL_API_KEY) {
    return { success: false, error: "Terminal API key not configured" };
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
    const response = await fetch(`${TERMINAL_BASE_URL}/shipments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TERMINAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rate_id: rateId,
        origin: formatAddress(pickup),
        destination: formatAddress(delivery),
        metadata: {
          ...metadata,
          is_cod: isCod,
        },
        is_cod: isCod,
        cod_amount: isCod ? codAmount : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Terminal booking error:", response.status, data);
      return { success: false, error: data?.message || "Booking failed" };
    }

    return {
      success: true,
      shipment_id: data?.data?.id || data?.id,
      tracking_code: data?.data?.tracking_number || data?.tracking_number,
      label_url: data?.data?.label_url || data?.label_url,
    };
  } catch (error: any) {
    console.error("Terminal booking error:", error);
    return { success: false, error: error.message };
  }
}

async function bookSendboxDelivery(
  pickup: DeliveryAddress,
  delivery: DeliveryAddress,
  weight: number,
  metadata: Record<string, any>,
): Promise<BookingResult> {
  if (!SENDBOX_API_KEY) {
    return { success: false, error: "Sendbox API key not configured" };
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
    const response = await fetch(`${SENDBOX_BASE_URL}/shipments`, {
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
        ...metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Sendbox booking error:", response.status, data);
      return { success: false, error: data?.message || "Booking failed" };
    }

    return {
      success: true,
      shipment_id: data?.data?.code || data?.data?.id,
      tracking_code: data?.data?.tracking_code || data?.tracking_code,
      label_url: data?.data?.label_url,
    };
  } catch (error: any) {
    console.error("Sendbox booking error:", error);
    return { success: false, error: error.message };
  }
}

async function bookShipbubbleDelivery(
  rateId: string,
  isCod: boolean,
): Promise<BookingResult> {
  if (!SHIPBUBBLE_API_KEY) {
    return { success: false, error: "Shipbubble API key not configured" };
  }

  try {
    // Parse the rate_id to get request_token, service_code, courier_id
    const [requestToken, serviceCode, courierId] = rateId.split("|");

    if (!requestToken || !serviceCode || !courierId) {
      return { success: false, error: "Invalid Shipbubble rate ID" };
    }

    const response = await fetch(`${SHIPBUBBLE_BASE_URL}/shipping/labels`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SHIPBUBBLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_token: requestToken,
        service_code: serviceCode,
        courier_id: courierId,
        is_cod_label: isCod,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Shipbubble booking error:", response.status, data);
      return { success: false, error: data?.message || "Booking failed" };
    }

    if (data.status !== "success") {
      return { success: false, error: data.message || "Booking failed" };
    }

    return {
      success: true,
      shipment_id: data.data?.order_id,
      tracking_code: data.data?.courier?.tracking_code,
      label_url: data.data?.waybill_document || data.data?.tracking_url,
    };
  } catch (error: any) {
    console.error("Shipbubble booking error:", error);
    return { success: false, error: error.message };
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // SECURITY: require an authenticated caller and verify shop ownership.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: authData, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: BookDeliveryRequest = await req.json();
    const {
      order_id,
      shop_id,
      rate_id,
      provider,
      pickup_address,
      delivery_address,
      delivery_fee,
      weight_kg,
      dimensions,
      is_cod = false,
      carrier_name,
      carrier_logo,
      metadata,
    } = body;

    // Verify the caller owns the shop they're booking for.
    const { data: shopRow, error: shopLookupErr } = await supabase
      .from("shops")
      .select("owner_id")
      .eq("id", shop_id)
      .maybeSingle();
    if (shopLookupErr || !shopRow || shopRow.owner_id !== authData.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get order for COD amount
    const { data: orderRow } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("id", order_id)
      .single();

    let providerShipmentId = null;
    let providerTrackingCode = null;
    let estimatedDeliveryDate = null;
    let labelUrl = null;

    if (provider === "shipbubble" && SHIPBUBBLE_API_KEY) {
      const bookingResult = await bookShipbubbleDelivery(rate_id || "", is_cod);

      if (bookingResult.success) {
        providerShipmentId = bookingResult.shipment_id;
        providerTrackingCode = bookingResult.tracking_code;
        labelUrl = bookingResult.label_url;
        estimatedDeliveryDate = new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString();
      } else {
        console.warn("Shipbubble booking failed:", bookingResult.error);
      }
    } else if (provider === "terminal" && TERMINAL_API_KEY) {
      const bookingResult = await bookTerminalDelivery(
        pickup_address,
        delivery_address,
        rate_id || "",
        is_cod,
        orderRow?.total_amount || 0,
        { order_id, shop_id, ...metadata },
      );

      if (bookingResult.success) {
        providerShipmentId = bookingResult.shipment_id;
        providerTrackingCode = bookingResult.tracking_code;
        labelUrl = bookingResult.label_url;
        estimatedDeliveryDate = new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString();
      } else {
        // Fall through to manual booking if Terminal fails
        console.warn(
          "Terminal booking failed, falling back to manual:",
          bookingResult.error,
        );
      }
    } else if (
      provider === "sendbox" &&
      SENDBOX_API_KEY &&
      !providerShipmentId
    ) {
      const bookingResult = await bookSendboxDelivery(
        pickup_address,
        delivery_address,
        weight_kg || 1,
        { order_id, shop_id, ...metadata },
      );

      if (bookingResult.success) {
        providerShipmentId = bookingResult.shipment_id;
        providerTrackingCode = bookingResult.tracking_code;
        labelUrl = bookingResult.label_url;
        estimatedDeliveryDate = new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString();
      }
    }

    // Create delivery order in database
    const deliveryStatus = providerShipmentId ? "confirmed" : "pending";

    const { data: deliveryOrder, error: insertError } = await supabase
      .from("delivery_orders")
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
        status: deliveryStatus,
        estimated_delivery_date: estimatedDeliveryDate,
        rate_id: rate_id || null,
        carrier_name: carrier_name || null,
        carrier_logo: carrier_logo || null,
        label_url: labelUrl || null,
        is_cod: is_cod,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Create initial tracking event
    const trackingDescription =
      provider === "manual"
        ? "Delivery booked manually"
        : providerShipmentId
          ? `Delivery booked with ${provider}${carrier_name ? ` (${carrier_name})` : ""}`
          : `Booking failed, marked as pending`;

    await supabase.from("delivery_tracking_events").insert({
      delivery_order_id: deliveryOrder.id,
      status: deliveryStatus,
      description: trackingDescription,
      notify_vendor: true,
      notify_customer: providerShipmentId ? true : false,
    });

    // Update order status to processing if it was confirmed
    if (deliveryStatus === "confirmed") {
      await supabase
        .from("orders")
        .update({
          status: "processing",
          processing_at: new Date().toISOString(),
        })
        .eq("id", order_id)
        .eq("status", "confirmed");
    }

    return new Response(
      JSON.stringify({
        success: true,
        delivery_order_id: deliveryOrder.id,
        tracking_code: providerTrackingCode,
        estimated_delivery: estimatedDeliveryDate,
        label_url: labelUrl,
        status: deliveryStatus,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error booking delivery:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
