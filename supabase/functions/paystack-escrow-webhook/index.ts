import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as crypto from "https://deno.land/std@0.168.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const bodyText = await req.text();
    
    // Validate signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(paystackSecretKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const expectedSignatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(bodyText)
    );
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignatureHex) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === "charge.success") {
      const metadata = event.data.metadata || {};
      const orderId = metadata.order_id;

      if (orderId) {
        // Escrow logic: mark order as paid but held in escrow
        const { error } = await supabase
          .from("orders")
          .update({ 
            payment_status: "held_in_escrow",
            status: "processing"
          })
          .eq("id", orderId);

        if (error) {
          console.error("Error updating order escrow status:", error);
          return new Response("Error updating database", { status: 500 });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 500 });
  }
});
