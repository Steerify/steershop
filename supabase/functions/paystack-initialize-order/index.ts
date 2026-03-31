import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type AllowedOriginConfig = {
  allowAllOrigins: boolean;
  allowedOrigins: string[];
};

const normalizeOrigin = (value: string) => {
  try {
    return new URL(value).origin;
  } catch {
    return value.trim();
  }
};

const buildAllowedOriginConfig = (): AllowedOriginConfig => {
  const configuredOrigins = [
    Deno.env.get("CORS_ALLOWED_ORIGINS"),
    Deno.env.get("SITE_URL"),
    Deno.env.get("APP_URL"),
  ]
    .filter(Boolean)
    .flatMap((value) => value!.split(","))
    .map((value) => value.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  const uniqueOrigins = [...new Set(configuredOrigins)];

  return {
    allowAllOrigins: uniqueOrigins.length === 0,
    allowedOrigins: uniqueOrigins,
  };
};

const createCorsHeaders = (origin: string | null, config: AllowedOriginConfig) => {
  if (config.allowAllOrigins) {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    };
  }

  const safeOrigin = origin && config.allowedOrigins.includes(normalizeOrigin(origin))
    ? normalizeOrigin(origin)
    : config.allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": safeOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

const isValidUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isAllowedCallbackUrl = (
  callbackUrl: string,
  requestOrigin: string | null,
  config: AllowedOriginConfig,
) => {
  if (!callbackUrl) return false;

  try {
    const callbackOrigin = new URL(callbackUrl).origin;

    if (requestOrigin && normalizeOrigin(requestOrigin) === callbackOrigin) {
      return true;
    }

    if (config.allowAllOrigins) {
      const siteUrl = Deno.env.get("SITE_URL") || Deno.env.get("APP_URL");
      if (!siteUrl) return false;
      return normalizeOrigin(siteUrl) === callbackOrigin;
    }

    return config.allowedOrigins.includes(callbackOrigin);
  } catch {
    return false;
  }
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const allowedOriginConfig = buildAllowedOriginConfig();
  const corsHeaders = createCorsHeaders(origin, allowedOriginConfig);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (
    !allowedOriginConfig.allowAllOrigins &&
    origin &&
    !allowedOriginConfig.allowedOrigins.includes(normalizeOrigin(origin))
  ) {
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!PAYSTACK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const { order_id, shop_id, customer_email, callback_url } = body;

    if (!order_id || !shop_id || !isValidUuid(order_id) || !isValidUuid(shop_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid order_id or shop_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Use authoritative order data from DB instead of trusting client payloads.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, shop_id, total_amount, payment_status, customer_email")
      .eq("id", order_id)
      .eq("shop_id", shop_id)
      .single();

    if (orderError || !order) {
      console.error("Order lookup failed:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (order.payment_status === "paid") {
      return new Response(
        JSON.stringify({ error: "Order already paid" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const paymentEmail = (order.customer_email || customer_email || "").trim().toLowerCase();

    if (!paymentEmail || !isValidEmail(paymentEmail)) {
      return new Response(
        JSON.stringify({ error: "A valid customer email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (callback_url && !isAllowedCallbackUrl(callback_url, origin, allowedOriginConfig)) {
      return new Response(
        JSON.stringify({ error: "Invalid callback URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Look up the shop's subaccount code
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("id, shop_name, paystack_subaccount_code")
      .eq("id", shop_id)
      .single();

    if (shopError || !shop) {
      console.error("Shop lookup failed:", shopError);
      return new Response(
        JSON.stringify({ error: "Shop not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const amountInKobo = Math.round(Number(order.total_amount) * 100);

    if (!Number.isFinite(amountInKobo) || amountInKobo <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid order total" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const paymentReference = `ORDER_${order.id}_${Date.now()}`;
    const hasSubaccount = !!shop.paystack_subaccount_code;
    const paymentMode = hasSubaccount ? "split" : "direct";

    // Build Paystack payload - include subaccount fields only if shop has one
    const paystackPayload: Record<string, unknown> = {
      email: paymentEmail,
      amount: amountInKobo,
      currency: "NGN",
      reference: paymentReference,
      callback_url: callback_url || undefined,
      metadata: {
        order_id: order.id,
        shop_id,
        payment_mode: paymentMode,
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: order.id,
          },
          {
            display_name: "Shop",
            variable_name: "shop_name",
            value: shop.shop_name,
          },
        ],
      },
    };

    if (hasSubaccount) {
      paystackPayload.subaccount = shop.paystack_subaccount_code;
      paystackPayload.bearer = "subaccount";
    }

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("Paystack initialization failed:", paystackData);
      return new Response(
        JSON.stringify({
          error: "Failed to initialize payment",
          details: paystackData.message,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: paystackData.data.reference,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("Error in paystack-initialize-order:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
