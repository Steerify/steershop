import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDefaultFromEmail } from "../_shared/smtp.ts";
import { buildEmailHtml } from "../_shared/email-html.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type OrderItem = { name: string; quantity: number; price: number };

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://steersolo.com";
const WHATSAPP_CLOUD_ACCESS_TOKEN = Deno.env.get("WHATSAPP_CLOUD_ACCESS_TOKEN");
const WHATSAPP_CLOUD_PHONE_NUMBER_ID = Deno.env.get(
  "WHATSAPP_CLOUD_PHONE_NUMBER_ID",
);
const WHATSAPP_DISPATCH_URL = Deno.env.get("WHATSAPP_DISPATCH_URL");
const WHATSAPP_DISPATCH_TOKEN = Deno.env.get("WHATSAPP_DISPATCH_TOKEN");

const normalizeWhatsAppPhone = (input?: string | null) => {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildVendorWhatsAppMessage = ({
  shortId,
  formattedAmount,
  customerName,
  customerPhone,
  customerEmail,
  paymentLabel,
  deliveryLabel,
  items,
}: {
  shortId: string;
  formattedAmount: string;
  customerName?: string;
  customerPhone?: string | null;
  customerEmail?: string;
  paymentLabel: string;
  deliveryLabel: string;
  items: OrderItem[];
}) => {
  const lines = [
    `New SteerSolo order #${shortId}`,
    "",
    `Customer: ${customerName || "N/A"}`,
    `Phone: ${customerPhone || "N/A"}`,
    `Email: ${customerEmail || "N/A"}`,
    `Payment: ${paymentLabel}`,
    `Delivery: ${deliveryLabel}`,
    "",
    "Items:",
    ...(items.length > 0
      ? items.map(
          item =>
            `- ${item.name} x ${item.quantity} (₦${Number(item.price * item.quantity).toLocaleString()})`,
        )
      : ["- No item details available"]),
    "",
    `Total: ${formattedAmount}`,
    `Manage order: ${APP_BASE_URL}/orders`,
    `Order reference: ${shortId}`,
  ];

  return lines.join("\n");
};

const buildFallbackWhatsAppUrl = (phone: string, message: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

const logWhatsAppDispatch = async (
  supabase: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
) => {
  try {
    await supabase.from("order_whatsapp_dispatches").insert(payload);
  } catch (error) {
    console.warn("Non-fatal: failed to log WhatsApp dispatch", error);
  }
};

const sendWhatsAppMessage = async (
  phone: string,
  message: string,
  eventType: string,
) => {
  if (WHATSAPP_CLOUD_ACCESS_TOKEN && WHATSAPP_CLOUD_PHONE_NUMBER_ID) {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${WHATSAPP_CLOUD_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_CLOUD_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phone,
          type: "text",
          text: {
            body: message,
            preview_url: true,
          },
        }),
      },
    );

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        payload?.error?.message || "Meta WhatsApp Cloud API failed",
      );
    }

    return { sent: true, mode: "meta_cloud", providerResponse: payload };
  }

  if (WHATSAPP_DISPATCH_URL) {
    const response = await fetch(WHATSAPP_DISPATCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(WHATSAPP_DISPATCH_TOKEN
          ? { Authorization: `Bearer ${WHATSAPP_DISPATCH_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        to: phone,
        message,
        eventType,
        source: "steersolo-order-notifications",
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error || "Custom WhatsApp dispatch failed");
    }

    return { sent: true, mode: "custom_dispatch", providerResponse: payload };
  }

  return { sent: false, mode: "chat_handoff" as const, providerResponse: null };
};

serve(async req => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const fromEmail = getDefaultFromEmail();

    const body = await req.json();
    const { orderId, eventType, statusUpdate } = body;
    let { 
      shopName, 
      customerEmail, 
      customerName, 
      totalAmount, 
      items,
      shopOwnerEmail,
      shopOwnerPhone,
      shopSlug,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      paymentReference
    } = body as {
      shopName?: string;
      customerEmail?: string;
      customerName?: string;
      totalAmount?: number;
      items?: OrderItem[];
      shopOwnerEmail?: string;
      shopOwnerPhone?: string;
      shopSlug?: string;
      deliveryAddress?: string;
      deliveryCity?: string;
      deliveryState?: string;
      paymentReference?: string;
    };

    if (!orderId || !eventType) {
      return new Response(
        JSON.stringify({ error: "Missing orderId or eventType" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --- Resolve shop owner + order details ---
    // Prefer data from the request payload to bypass potential DB/RLS connection issues
    let isPaid = false;
    let digitalItemsHtml = "";
    let customerPhone = body.customerPhone || null;

    try {
      const { data: orderRow } = await supabase
        .from("orders")
        .select(
          "payment_status, payment_reference, status, total_amount, customer_email, customer_name, customer_phone, delivery_address, delivery_city, delivery_state, shop_id, shops(shop_name, shop_slug, owner_id, whatsapp_number)",
        )
        .eq("id", orderId)
        .maybeSingle();

      if (orderRow) {
        const shopJoin: any = orderRow.shops;
        if (!shopName) shopName = shopJoin?.shop_name;
        if (!customerEmail) customerEmail = orderRow.customer_email || undefined;
        if (!customerName) customerName = orderRow.customer_name || undefined;
        if (!customerPhone) customerPhone = orderRow.customer_phone || null;
        if (totalAmount == null) totalAmount = Number(orderRow.total_amount || 0);
        if (!deliveryAddress) deliveryAddress = orderRow.delivery_address || null;
        if (!deliveryCity) deliveryCity = orderRow.delivery_city || null;
        if (!deliveryState) deliveryState = orderRow.delivery_state || null;
        if (!paymentReference) paymentReference = orderRow.payment_reference || null;
        if (!shopSlug) shopSlug = shopJoin?.shop_slug || null;
        if (!shopOwnerPhone) shopOwnerPhone = shopJoin?.whatsapp_number || null;
        
        isPaid =
          orderRow.payment_status === "paid" ||
          [
            "confirmed",
            "processing",
            "out_for_delivery",
            "delivered",
            "completed",
          ].includes(orderRow.status || statusUpdate || "");

        if (shopJoin?.owner_id && !shopOwnerEmail) {
          const { data: owner } = await supabase
            .from("profiles")
            .select("email, phone")
            .eq("id", shopJoin.owner_id)
            .maybeSingle();
          if (!shopOwnerEmail) shopOwnerEmail = owner?.email || null;
          if (!shopOwnerPhone) shopOwnerPhone = owner?.phone || null;
        }
      } else {
        // Fallback: If DB fetch fails but payload has data, assume paid based on eventType
        isPaid = eventType === "order_paid" || ["confirmed", "processing", "out_for_delivery", "delivered", "completed"].includes(statusUpdate || "");
      }

      // Resolve items if caller didn't supply them
      if (!items || items.length === 0) {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select(
            "quantity, price, products(name, is_digital, digital_file_url, digital_delivery_text)",
          )
          .eq("order_id", orderId);
        if (orderItems) {
          items = orderItems.map((i: any) => ({
            name: i.products?.name || "Item",
            quantity: i.quantity,
            price: Number(i.price),
          }));

          const digitalItems = orderItems.filter(
            (i: any) => i.products?.is_digital,
          );
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
        item =>
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
    const deliveryLabel = deliveryAddress
      ? [deliveryAddress, deliveryCity, deliveryState]
          .filter(Boolean)
          .join(", ")
      : digitalItemsHtml
        ? "Digital delivery"
        : "Delivery details pending";
    const paymentLabel =
      eventType === "order_paid" || isPaid
        ? `Paid${paymentReference ? ` (${paymentReference})` : ""}`
        : "Pending seller action";

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
          <p>${
            isPaidEvt
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
          <p>${
            isPaidEvt
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
      const reviewHtml =
        isDelivered && shopSlug
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
        const messageId = crypto.randomUUID();
        const { error: queueErr } = await (supabase as any).rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            message_id: messageId,
            label: `order-${eventType}`,
            to: customerEmail,
            from: fromEmail,
            reply_to: 'mail@steersolo.com',
            subject: customerSubject,
            html: customerBodyHtml,
            queued_at: new Date().toISOString(),
          },
        });
        if (queueErr) {
          console.error("Failed to enqueue customer email:", queueErr);
        } else {
          console.log("Customer email enqueued", {
            orderId,
            eventType,
            messageId,
          });
          try {
            await (supabase as any).from("email_send_log").insert({
              message_id: messageId,
              template_name: `order-${eventType}`,
              recipient_email: customerEmail,
              status: "pending",
            });
          } catch (e) {
            console.warn("email_send_log pending insert failed (non-fatal):", e);
          }
        }
      } catch (e) {
        console.error("Customer email failed:", e);
      }
    }

    // Send to shop owner (resolved server-side)
    if (shopOwnerEmail && ownerSubject) {
      try {
        const messageId = crypto.randomUUID();
        const { error: queueErr } = await (supabase as any).rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            message_id: messageId,
            label: `order-${eventType}-owner`,
            to: shopOwnerEmail,
            from: fromEmail,
            reply_to: 'mail@steersolo.com',
            subject: ownerSubject,
            html: ownerBodyHtml,
            queued_at: new Date().toISOString(),
          },
        });
        if (queueErr) {
          console.error("Failed to enqueue owner email:", queueErr);
        } else {
          console.log("Owner email enqueued", {
            orderId,
            eventType,
            messageId,
          });
          try {
            await (supabase as any).from("email_send_log").insert({
              message_id: messageId,
              template_name: `order-${eventType}-owner`,
              recipient_email: shopOwnerEmail,
              status: "pending",
            });
          } catch (e) {
            console.warn("email_send_log pending insert failed (non-fatal):", e);
          }
        }
      } catch (e) {
        console.error("Owner email failed:", e);
      }
    }

    // SMS via Termii on new/paid orders
    if (
      (eventType === "order_placed" || eventType === "order_paid") &&
      shopOwnerPhone
    ) {
      const termiiApiKey = Deno.env.get("TERMII_API_KEY");
      if (termiiApiKey) {
        try {
          const itemNames = (items || [])
            .slice(0, 3)
            .map(i => i.name)
            .join(", ");
          const tag = eventType === "order_paid" ? "PAID" : "NEW";
          const smsMessage = `SteerSolo ${tag}: Order #${shortId} (${formattedAmount}) from ${customerName || "a customer"}. ${itemNames || ""}. Log in to process.`;
          let phone = shopOwnerPhone.replace(/\s+/g, "").replace(/^0/, "234");
          if (!phone.startsWith("+") && !phone.startsWith("234"))
            phone = "234" + phone;
          await fetch("https://api.ng.termii.com/api/sms/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: phone,
              from: "SteerSolo",
              sms: smsMessage,
              type: "plain",
              channel: "generic",
              api_key: termiiApiKey,
            }),
          });
        } catch (smsErr) {
          console.error("SMS failed (non-fatal):", smsErr);
        }
      }
    }

    let whatsapp: {
      sent: boolean;
      mode: string;
      fallbackUrl: string | null;
      error?: string;
    } | null = null;

    if (
      (eventType === "order_placed" || eventType === "order_paid") &&
      shopOwnerPhone
    ) {
      const normalizedPhone = normalizeWhatsAppPhone(shopOwnerPhone);
      if (normalizedPhone) {
        const whatsappMessage = buildVendorWhatsAppMessage({
          shortId,
          formattedAmount,
          customerName,
          customerPhone,
          customerEmail,
          paymentLabel,
          deliveryLabel,
          items: items || [],
        });
        const fallbackUrl = buildFallbackWhatsAppUrl(
          normalizedPhone,
          whatsappMessage,
        );

        try {
          const directResult = await sendWhatsAppMessage(
            normalizedPhone,
            whatsappMessage,
            eventType,
          );
          whatsapp = {
            sent: directResult.sent,
            mode: directResult.mode,
            fallbackUrl: directResult.sent ? null : fallbackUrl,
          };

          await logWhatsAppDispatch(supabase, {
            order_id: orderId,
            recipient_role: "shop_owner",
            recipient_phone: normalizedPhone,
            event_type: eventType,
            provider: directResult.mode,
            status: directResult.sent ? "sent" : "fallback",
            message_body: whatsappMessage,
            fallback_url: directResult.sent ? null : fallbackUrl,
            provider_response: directResult.providerResponse,
            sent_at: directResult.sent ? new Date().toISOString() : null,
          });
        } catch (whatsAppError) {
          const message =
            whatsAppError instanceof Error
              ? whatsAppError.message
              : "Unknown WhatsApp dispatch error";
          whatsapp = {
            sent: false,
            mode: "chat_handoff",
            fallbackUrl,
            error: message,
          };

          await logWhatsAppDispatch(supabase, {
            order_id: orderId,
            recipient_role: "shop_owner",
            recipient_phone: normalizedPhone,
            event_type: eventType,
            provider: "chat_handoff",
            status: "fallback",
            message_body: whatsappMessage,
            fallback_url: fallbackUrl,
            error_message: message,
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, whatsapp }), {
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
