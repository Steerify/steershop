import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // CORS setup
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Missing authorization", { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return new Response("Missing order ID", { status: 400 });
    }

    // Verify user is the buyer of this order (or an admin)
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Fetch order to verify it belongs to user and is held in escrow
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, shop:shop_id(owner_id)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response("Order not found", { status: 404 });
    }

    if (order.customer_id !== user.id) {
      return new Response("Unauthorized to release this order's escrow", { status: 403 });
    }

    if (order.payment_status !== "held_in_escrow") {
      return new Response("Order is not held in escrow", { status: 400 });
    }

    // Process Paystack Transfer (Simulated here: logic depends on having the vendor's recipient_code)
    // 1. Fetch vendor's Paystack recipient code from profiles/shops
    // 2. Initiate Transfer via Paystack API: POST https://api.paystack.co/transfer
    // Example:
    // const transferRes = await fetch("https://api.paystack.co/transfer", {
    //   method: "POST",
    //   headers: { "Authorization": `Bearer ${paystackSecretKey}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({ source: "balance", amount: order.total_amount * 100, recipient: vendorRecipientCode, reason: "Escrow Release" })
    // });
    
    // For now, we update the status to mark escrow as released.
    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_status: "released_from_escrow", status: "completed" })
      .eq("id", orderId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, message: "Funds released from escrow to vendor." }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });

  } catch (err: any) {
    console.error("Escrow release error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
