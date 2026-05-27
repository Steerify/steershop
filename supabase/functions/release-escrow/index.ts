import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") || "";

// Platform keeps this share of the order; the rest is transferred to the vendor.
const COMMISSION_RATE = 0.1;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!paystackSecretKey) {
      return json({ error: "Payments are not configured" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization" }, 401);
    }

    const { orderId } = await req.json().catch(() => ({}));
    if (!orderId) {
      return json({ error: "Missing order ID" }, 400);
    }

    // Authenticate the caller
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Fetch the order plus the vendor's payout details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, customer_id, shop_id, total_amount, payment_status, escrow_transfer_reference, " +
        "shop:shop_id(id, owner_id, shop_name, bank_code, bank_account_number, bank_account_name, paystack_recipient_code)"
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return json({ error: "Order not found" }, 404);
    }

    const shop = (order as any).shop as {
      id: string;
      owner_id: string;
      shop_name: string;
      bank_code: string | null;
      bank_account_number: string | null;
      bank_account_name: string | null;
      paystack_recipient_code: string | null;
    } | null;

    // Only the buyer who placed the order, or an admin, may release escrow.
    let isAdmin = false;
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    isAdmin = !!adminRole;

    if (order.customer_id !== user.id && !isAdmin) {
      return json({ error: "You are not allowed to release this order's escrow" }, 403);
    }

    // Idempotency: already released
    if (order.payment_status === "released_from_escrow") {
      return json({ success: true, message: "Funds were already released to the vendor.", alreadyReleased: true });
    }

    if (order.payment_status !== "held_in_escrow") {
      return json({ error: "This order's funds are not currently held in escrow" }, 400);
    }

    if (!shop) {
      return json({ error: "Vendor shop not found for this order" }, 404);
    }

    await supabase.from("escrow_events").insert({
      order_id: order.id,
      shop_id: shop.id,
      event: "release_requested",
      amount_ngn: Number(order.total_amount),
      metadata: { requested_by: isAdmin ? "admin" : "buyer", user_id: user.id },
    });

    // Ensure the vendor has a Paystack transfer recipient
    let recipientCode = shop.paystack_recipient_code;
    if (!recipientCode) {
      if (!shop.bank_code || !shop.bank_account_number) {
        return json({
          error: "The vendor has not added their bank account yet, so funds cannot be released. Please ask the seller to complete their payout setup.",
          code: "NO_BANK_DETAILS",
        }, 422);
      }

      const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
        method: "POST",
        headers: { Authorization: `Bearer ${paystackSecretKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "nuban",
          name: shop.bank_account_name || shop.shop_name,
          account_number: shop.bank_account_number,
          bank_code: shop.bank_code,
          currency: "NGN",
        }),
      });
      const recipientData = await recipientRes.json();
      if (!recipientRes.ok || !recipientData.status || !recipientData.data?.recipient_code) {
        console.error("Failed to create transfer recipient", recipientData);
        await supabase.from("escrow_events").insert({
          order_id: order.id, shop_id: shop.id, event: "release_failed",
          metadata: { stage: "create_recipient", paystack: recipientData?.message },
        });
        return json({ error: "Could not set up the vendor payout account. Please try again later." }, 502);
      }
      recipientCode = recipientData.data.recipient_code;
      await supabase.from("shops").update({ paystack_recipient_code: recipientCode }).eq("id", shop.id);
    }

    // Vendor share = total minus the platform commission
    const grossAmount = Number(order.total_amount);
    const platformFee = Math.round(grossAmount * COMMISSION_RATE * 100) / 100;
    const vendorAmount = Math.round((grossAmount - platformFee) * 100) / 100;
    const vendorAmountKobo = Math.round(vendorAmount * 100);

    if (!Number.isFinite(vendorAmountKobo) || vendorAmountKobo <= 0) {
      return json({ error: "Invalid escrow amount" }, 400);
    }

    // Stable reference keeps Paystack from double-paying on retries
    const transferReference = order.escrow_transfer_reference || `ESCROW_${order.id}`;

    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: { Authorization: `Bearer ${paystackSecretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "balance",
        amount: vendorAmountKobo,
        recipient: recipientCode,
        reason: `Escrow release for order ${String(order.id).slice(0, 8)}`,
        reference: transferReference,
      }),
    });
    const transferData = await transferRes.json();
    const transferStatus = transferData?.data?.status;

    // 'success' = paid, 'pending' = queued for settlement. Both mean the
    // funds are committed. 'otp' means the account requires OTP on transfers,
    // which must be disabled for automated escrow release.
    const transferOk = transferRes.ok && transferData.status &&
      (transferStatus === "success" || transferStatus === "pending");

    if (!transferOk) {
      console.error("Escrow transfer failed", transferData);
      await supabase.from("escrow_events").insert({
        order_id: order.id, shop_id: shop.id, event: "release_failed",
        amount_ngn: vendorAmount, reference: transferReference,
        metadata: { stage: "transfer", status: transferStatus, paystack: transferData?.message },
      });
      const needsOtp = transferStatus === "otp";
      return json({
        error: needsOtp
          ? "Automated payouts require Transfer OTP to be disabled on the Paystack account."
          : (transferData?.message || "The payout could not be completed. Funds remain safely held in escrow."),
      }, 502);
    }

    // Mark released
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "released_from_escrow",
        status: "completed",
        buyer_confirmed_at: new Date().toISOString(),
        escrow_released_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        escrow_transfer_code: transferData.data?.transfer_code || null,
        escrow_transfer_reference: transferReference,
      })
      .eq("id", order.id);
    if (updateError) throw updateError;

    // Recognise revenue + platform earnings now that funds have moved
    const { data: revenueRow } = await supabase
      .from("revenue_transactions")
      .insert({
        shop_id: shop.id,
        order_id: order.id,
        amount: vendorAmount,
        gross_amount: grossAmount,
        platform_fee_percentage: COMMISSION_RATE * 100,
        platform_fee: platformFee,
        currency: "NGN",
        payment_reference: transferReference,
        payment_method: "paystack_transfer",
        transaction_type: "order_payment",
        metadata: { escrow: true, transfer_code: transferData.data?.transfer_code },
      })
      .select()
      .maybeSingle();

    await supabase.from("platform_earnings").insert({
      transaction_id: revenueRow?.id || null,
      shop_id: shop.id,
      order_id: order.id,
      gross_amount: grossAmount,
      fee_percentage: COMMISSION_RATE * 100,
      fee_amount: platformFee,
      net_to_shop: vendorAmount,
    });

    await supabase.from("escrow_events").insert({
      order_id: order.id, shop_id: shop.id, event: "released",
      amount_ngn: vendorAmount, reference: transferReference,
      metadata: { transfer_code: transferData.data?.transfer_code, status: transferStatus },
    });

    return json({
      success: true,
      message: "Delivery confirmed. Funds have been released to the vendor.",
      vendorAmount,
      platformFee,
    });
  } catch (err: any) {
    console.error("Escrow release error:", err);
    return json({ error: err.message || "Internal error" }, 500);
  }
});
