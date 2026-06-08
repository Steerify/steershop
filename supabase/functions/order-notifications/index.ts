import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getTransporter, getDefaultFromEmail } from "../_shared/smtp.ts";
import { buildEmailHtml } from "../_shared/email-html.ts";

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
                    `<li><strong>${i.products.name}</strong> — <a href="${i.products.digital_file_url}">Download</a></li>`,
                )
                .join("");
              digitalItemsHtml = `
                <div class="download-box">
                  <h3>✅ Your downloads</h3>
                  <ul style="padding-left:0">${links}</ul>
                </div>`;
            } else {
              digitalItemsHtml = `
                <div class="pending-box">
                  <h3>🔒 Downloads pending payment</h3>
                  <p>Files unlock as soon as your payment is confirmed.</p>
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
    const itemsTableRows = (items || [])
      .map(
        (item) =>
          `<tr><td>${item.name}</td><td style="text-align:center">${item.quantity}</td><td>₦${Number(item.price * item.quantity).toLocaleString()}</td></tr>`,
      )
      .join("");
    const itemsTable = `
      <table class="items-table">
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th>Amount</th></tr></thead>
        <tbody>${itemsTableRows}</tbody>
        <tfoot><tr class="total-row"><td colspan="2">Total</td><td>${formattedAmount}</td></tr></tfoot>
      </table>`;

    const orderIdBanner = `<div class="order-id">Order <strong>#${shortId}</strong></div>`;

    let customerSubject = "";
    let customerBodyHtml = "";
    let ownerSubject = "";
    let ownerBodyHtml = "";

    if (eventType === "order_placed" || eventType === "order_paid") {
      const isPaidEvt = eventType === "order_paid";

      customerSubject = isPaidEvt
        ? `Payment Confirmed — Order #${shortId}`
        : `Order Received #${shortId} - ${shopName || "SteerSolo"}`;

      customerBodyHtml = buildEmailHtml({
        headerClass: isPaidEvt ? "header-paid" : "header-accent",
        badge: {
          text: isPaidEvt ? "Payment Confirmed" : "Order Received",
          class: isPaidEvt ? "badge-green" : "badge-blue",
        },
        title: isPaidEvt ? "Payment Confirmed ✅" : "Order Received 🛒",
        body: `
          ${orderIdBanner}
          <p>Hi <strong>${customerName || "Valued Customer"}</strong>,</p>
          <p>${isPaidEvt
            ? "Your payment is confirmed and held safely in escrow. The seller has been notified."
            : `Thanks for your order from <strong>${shopName || "SteerSolo"}</strong>. The seller will confirm it shortly.`
          }</p>
          ${itemsTable}
          ${digitalItemsHtml}`,
      });

      ownerSubject = isPaidEvt
        ? `💰 Paid Order #${shortId} - ${formattedAmount}`
        : `🛒 New Order #${shortId} - ${formattedAmount}`;

      ownerBodyHtml = buildEmailHtml({
        headerClass: isPaidEvt ? "header-paid" : "header-accent",
        badge: {
          text: isPaidEvt ? "Funds in Escrow" : "New Order",
          class: isPaidEvt ? "badge-green" : "badge-amber",
        },
        title: isPaidEvt ? "Payment Received 💰" : "New Order Received 🎉",
        body: `
          ${orderIdBanner}
          <p>${isPaidEvt
            ? "Funds are held in escrow and will be released once the buyer confirms delivery."
            : `New order on <strong>${shopName || "your shop"}</strong>.`
          }</p>
          <p><strong>Customer:</strong> ${customerName || "N/A"}</p>
          <p><strong>Email:</strong> ${customerEmail || "N/A"}</p>
          ${itemsTable}
          <div class="cta-wrap">
            <a href="https://steersolo.com/dashboard" class="cta">Go to Dashboard →</a>
          </div>`,
      });

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
        ? `<div class="review-box">
             <h3>How did we do? ⭐</h3>
             <a href="https://steersolo.com/shop/${shopSlug}" class="review-btn">Leave a Review</a>
           </div>`
        : "";

      customerBodyHtml = buildEmailHtml({
        headerClass: "header-accent",
        badge: { text: "Order Update", class: "badge-blue" },
        title: "Order Update 📦",
        body: `
          ${orderIdBanner}
          <p>Hi <strong>${customerName || "Valued Customer"}</strong>,</p>
          <p>Your order from <strong>${shopName || "SteerSolo"}</strong>:</p>
          <div class="status-box">
            <div class="status-label">Status</div>
            <div class="status-value">${statusLabel.toUpperCase()}</div>
          </div>
          <p>${statusMessages[statusUpdate] || "Your order status has been updated."}</p>
          <p><strong>Amount:</strong> ${formattedAmount}</p>
          ${digitalItemsHtml}
          ${reviewHtml}`,
      });

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
