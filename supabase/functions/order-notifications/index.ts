import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getTransporter, getDefaultFromEmail } from "../_shared/smtp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type OrderItem = { name: string; quantity: number; price: number };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const transporter = await getTransporter();
    const fromEmail = getDefaultFromEmail();

    const body = await req.json();
    const { orderId, eventType, statusUpdate } = body;
    let {
      shopName,
      customerEmail,
      customerName,
      totalAmount,
      items,
    } = body as {
      shopName?: string;
      customerEmail?: string;
      customerName?: string;
      totalAmount?: number;
      items?: OrderItem[];
    };

    if (!orderId || !eventType) {
      return new Response(JSON.stringify({ error: "Missing orderId or eventType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --- Resolve shop owner + order details server-side (never trust client) ---
    let shopOwnerEmail: string | null = null;
    let shopOwnerPhone: string | null = null;
    let shopSlug: string | null = null;
    let isPaid = false;
    let digitalItemsHtml = "";

    try {
      const { data: orderRow } = await supabase
        .from("orders")
        .select(
          "payment_status, status, total_amount, customer_email, customer_name, shop_id, shops(shop_name, shop_slug, owner_id, whatsapp_number)",
        )
        .eq("id", orderId)
        .maybeSingle();

      if (orderRow) {
        const shopJoin: any = orderRow.shops;
        if (!shopName) shopName = shopJoin?.shop_name;
        if (!customerEmail) customerEmail = orderRow.customer_email || undefined;
        if (!customerName) customerName = orderRow.customer_name || undefined;
        if (totalAmount == null) totalAmount = Number(orderRow.total_amount || 0);
        shopSlug = shopJoin?.shop_slug || null;
        shopOwnerPhone = shopJoin?.whatsapp_number || null;
        isPaid =
          orderRow.payment_status === "paid" ||
          ["confirmed", "processing", "out_for_delivery", "delivered", "completed"].includes(
            orderRow.status || statusUpdate || "",
          );

        if (shopJoin?.owner_id) {
          const { data: owner } = await supabase
            .from("profiles")
            .select("email, phone")
            .eq("id", shopJoin.owner_id)
            .maybeSingle();
          shopOwnerEmail = owner?.email || null;
          if (!shopOwnerPhone) shopOwnerPhone = owner?.phone || null;
        }
      }

      // Resolve items if caller didn't supply them
      if (!items || items.length === 0) {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("quantity, price, products(name, is_digital, digital_file_url, digital_delivery_text)")
          .eq("order_id", orderId);
        if (orderItems) {
          items = orderItems.map((i: any) => ({
            name: i.products?.name || "Item",
            quantity: i.quantity,
            price: Number(i.price),
          }));

          const digitalItems = orderItems.filter((i: any) => i.products?.is_digital);
          if (digitalItems.length > 0) {
            if (isPaid) {
              const links = digitalItems
                .map(
                  (i: any) =>
                    `<li style="margin:6px 0"><strong>${i.products.name}</strong> — <a href="${i.products.digital_file_url}" style="color:#1d4ed8">Download</a></li>`,
                )
                .join("");
              digitalItemsHtml = `
                <div style="margin:20px 0;padding:20px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px">
                  <h3 style="margin:0 0 8px;color:#065f46">✅ Your downloads</h3>
                  <ul style="margin:0;padding-left:18px">${links}</ul>
                </div>`;
            } else {
              digitalItemsHtml = `
                <div style="margin:20px 0;padding:20px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px">
                  <h3 style="margin:0 0 8px;color:#b45309">🔒 Downloads pending payment</h3>
                  <p style="margin:0;color:#4b5563;font-size:13px">Files unlock as soon as your payment is confirmed.</p>
                </div>`;
            }
          }
        }
      }
    } catch (dbErr) {
      console.error("Non-fatal: order/shop lookup failed:", dbErr);
    }

    const shortId = orderId.slice(0, 8).toUpperCase();
    const formattedAmount = `₦${Number(totalAmount || 0).toLocaleString()}`;
    const itemsHtml = (items || [])
      .map(
        (item) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₦${Number(item.price * item.quantity).toLocaleString()}</td></tr>`,
      )
      .join("");

    let customerSubject = "";
    let customerBodyHtml = "";
    let ownerSubject = "";
    let ownerBodyHtml = "";

    if (eventType === "order_placed" || eventType === "order_paid") {
      const isPaidEvt = eventType === "order_paid";
      customerSubject = isPaidEvt
        ? `Payment Confirmed — Order #${shortId}`
        : `Order Received #${shortId} - ${shopName || "SteerSolo"}`;
      customerBodyHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:${isPaidEvt ? "#16a34a" : "#0f3460"};color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
            <h1 style="margin:0">${isPaidEvt ? "Payment Confirmed ✅" : "Order Received 🛒"}</h1>
          </div>
          <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <p>Hi ${customerName || "Valued Customer"},</p>
            <p>${isPaidEvt ? "Your payment for this order is confirmed and held safely." : `Thanks for your order from <strong>${shopName || "SteerSolo"}</strong>.`}</p>
            <p><strong>Order ID:</strong> #${shortId}</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <thead><tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Amount</th></tr></thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot><tr><td colspan="2" style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;text-align:right;font-weight:bold">${formattedAmount}</td></tr></tfoot>
            </table>
            ${digitalItemsHtml}
            <p style="color:#6b7280;font-size:12px;margin-top:24px">SteerSolo · Automated email — do not reply.</p>
          </div>
        </div>`;

      ownerSubject = isPaidEvt
        ? `💰 Paid Order #${shortId} - ${formattedAmount}`
        : `🛒 New Order #${shortId} - ${formattedAmount}`;
      ownerBodyHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:${isPaidEvt ? "#16a34a" : "#f97316"};color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
            <h1 style="margin:0">${isPaidEvt ? "Payment Received 💰" : "New Order Received 🎉"}</h1>
          </div>
          <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <p>Hey there,</p>
            <p>${isPaidEvt ? "Funds are held in escrow and will release after the buyer confirms delivery." : `New order on <strong>${shopName || "your shop"}</strong>.`}</p>
            <p><strong>Order ID:</strong> #${shortId}</p>
            <p><strong>Customer:</strong> ${customerName || "N/A"}</p>
            <p><strong>Email:</strong> ${customerEmail || "N/A"}</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <thead><tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Amount</th></tr></thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot><tr><td colspan="2" style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;text-align:right;font-weight:bold">${formattedAmount}</td></tr></tfoot>
            </table>
            <p>Log in to your SteerSolo dashboard to process this order.</p>
          </div>
        </div>`;
    } else if (eventType === "status_update") {
      const statusLabel = (statusUpdate || "").replace(/_/g, " ");
      customerSubject = `Order #${shortId} - ${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}`;
      const statusMessages: Record<string, string> = {
        confirmed: "Your order has been confirmed by the seller.",
        processing: "Your order is being prepared.",
        out_for_delivery: "Your order is on its way!",
        delivered: "Your order has been delivered. Enjoy!",
        completed: "Your order is complete. Thanks for shopping with us!",
        cancelled: "Your order has been cancelled.",
      };
      const isDelivered = statusUpdate === "delivered";
      const reviewHtml = isDelivered && shopSlug
        ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:24px 0;text-align:center">
             <h3 style="margin:0 0 8px;color:#92400e">How did we do? ⭐</h3>
             <a href="https://steersolo.com/shop/${shopSlug}" style="display:inline-block;background:#d97706;color:#fff;padding:10px 20px;font-weight:bold;text-decoration:none;border-radius:6px">Leave a Review</a>
           </div>`
        : "";
      customerBodyHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#2563eb;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
            <h1 style="margin:0">Order Update 📦</h1>
          </div>
          <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <p>Hi ${customerName || "Valued Customer"},</p>
            <p><strong>Order #${shortId}</strong> from <strong>${shopName || "SteerSolo"}</strong></p>
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin:16px 0">
              <p style="margin:0;font-weight:bold">Status: ${statusLabel.toUpperCase()}</p>
              <p style="margin:8px 0 0;color:#374151">${statusMessages[statusUpdate] || "Status updated."}</p>
            </div>
            <p>Amount: <strong>${formattedAmount}</strong></p>
            ${digitalItemsHtml}
            ${reviewHtml}
          </div>
        </div>`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown event type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send to customer
    if (customerEmail && customerSubject) {
      try {
        const info = await transporter.sendMail({
          from: fromEmail,
          to: customerEmail,
          subject: customerSubject,
          html: customerBodyHtml,
        });
        console.log("Customer email sent", { orderId, eventType, messageId: info?.messageId });
      } catch (e) {
        console.error("Customer email failed:", e);
      }
    }

    // Send to shop owner (resolved server-side)
    if (shopOwnerEmail && ownerSubject) {
      try {
        const info = await transporter.sendMail({
          from: fromEmail,
          to: shopOwnerEmail,
          subject: ownerSubject,
          html: ownerBodyHtml,
        });
        console.log("Owner email sent", { orderId, eventType, messageId: info?.messageId });
      } catch (e) {
        console.error("Owner email failed:", e);
      }
    }

    // SMS via Termii on new/paid orders
    if ((eventType === "order_placed" || eventType === "order_paid") && shopOwnerPhone) {
      const termiiApiKey = Deno.env.get("TERMII_API_KEY");
      if (termiiApiKey) {
        try {
          const itemNames = (items || []).slice(0, 3).map((i) => i.name).join(", ");
          const tag = eventType === "order_paid" ? "PAID" : "NEW";
          const smsMessage = `SteerSolo ${tag}: Order #${shortId} (${formattedAmount}) from ${customerName || "a customer"}. ${itemNames || ""}. Log in to process.`;
          let phone = shopOwnerPhone.replace(/\s+/g, "").replace(/^0/, "234");
          if (!phone.startsWith("+") && !phone.startsWith("234")) phone = "234" + phone;
          await fetch("https://api.ng.termii.com/api/sms/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: phone, from: "SteerSolo", sms: smsMessage,
              type: "plain", channel: "generic", api_key: termiiApiKey,
            }),
          });
        } catch (smsErr) {
          console.error("SMS failed (non-fatal):", smsErr);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Order notification error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
