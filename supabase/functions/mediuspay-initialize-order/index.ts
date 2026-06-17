
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const mediuspayApiKey = Deno.env.get("MEDIUSPAY_API_KEY") || "";
const mediuspayBaseUrl = "https://mediuspay-server.onrender.com/api/partner/v1";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const {
      partner_seller_id,
      amount_ngn,
      customer_email,
      customer_name,
      partner_fee_bps,
      partner_fee_ngn,
      partner_reference,
      title,
      redirect_url,
    } = await req.json();

    // Create idempotency key
    const idempotencyKey = crypto.randomUUID();

    const response = await fetch(`${mediuspayBaseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mediuspayApiKey}`,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        partner_seller_id,
        amount_ngn,
        customer_email,
        customer_name,
        partner_fee_bps,
        partner_fee_ngn,
        partner_reference,
        title,
        redirect_url,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.message || "Failed to create Mediuspay order" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Mediuspay initialize error:", err);
    return new Response(`Error: ${err.message}`, {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
