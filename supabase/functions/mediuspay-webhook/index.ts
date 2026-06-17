
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as crypto from "https://deno.land/std@0.168.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const mediuspayWebhookSecret = Deno.env.get("MEDIUSPAY_WEBHOOK_SECRET") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const signatureHeader = req.headers.get("x-wisepay-signature");
    if (!signatureHeader) {
      return new Response("Missing signature", { status: 400 });
    }

    const bodyText = await req.text();
    
    // Parse and verify signature
    const match = /t=(\d+),v1=([a-f0-9]+)/.exec(signatureHeader);
    if (!match) {
      return new Response("Invalid signature format", { status: 400 });
    }

    const timestamp = match[1];
    const signature = match[2];

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(mediuspayWebhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedSignatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${timestamp}.${bodyText}`)
    );
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignatureHex) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(bodyText);

    // Handle different event types
    switch (event.event) {
      case "order.paid":
        await handleOrderPaid(event.data);
        break;
      case "order.delivered":
        await handleOrderDelivered(event.data);
        break;
      case "order.completed":
        await handleOrderCompleted(event.data);
        break;
      case "order.refunded":
        await handleOrderRefunded(event.data);
        break;
      default:
        console.log("Unhandled Mediuspay event:", event.event);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (err: any) {
    console.error("Mediuspay webhook error:", err);
    return new Response(`Webhook Error: ${err.message}`, {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

async function handleOrderPaid(order: any) {
  const partnerReference = order.partner_reference;
  if (!partnerReference) return;

  const { error } = await supabase
    .from("orders")
    .update({ 
      payment_status: "held_in_escrow",
      status: "processing"
    })
    .eq("id", partnerReference);

  if (error) {
    console.error("Error updating order on order.paid:", error);
  }
}

async function handleOrderDelivered(order: any) {
  const partnerReference = order.partner_reference;
  if (!partnerReference) return;

  const { error } = await supabase
    .from("orders")
    .update({ 
      status: "delivered"
    })
    .eq("id", partnerReference);

  if (error) {
    console.error("Error updating order on order.delivered:", error);
  }
}

async function handleOrderCompleted(order: any) {
  const partnerReference = order.partner_reference;
  if (!partnerReference) return;

  const { error } = await supabase
    .from("orders")
    .update({ 
      payment_status: "completed",
      status: "completed"
    })
    .eq("id", partnerReference);

  if (error) {
    console.error("Error updating order on order.completed:", error);
  }
}

async function handleOrderRefunded(order: any) {
  const partnerReference = order.partner_reference;
  if (!partnerReference) return;

  const { error } = await supabase
    .from("orders")
    .update({ 
      payment_status: "refunded",
      status: "cancelled"
    })
    .eq("id", partnerReference);

  if (error) {
    console.error("Error updating order on order.refunded:", error);
  }
}
