import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const defaultFromEmail = "mail@steersolo.com";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

let emailTransporter: ReturnType<typeof nodemailer.createTransport> | null =
  null;

function getEmailConfig() {
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = Number(Deno.env.get("SMTP_PORT") || 465);
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");
  const smtpFromEmail = Deno.env.get("SMTP_FROM_EMAIL") || defaultFromEmail;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  if (!emailTransporter) {
    emailTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return {
    from: `SteerSolo <${smtpFromEmail}>`,
    replyTo: defaultFromEmail,
    transporter: emailTransporter,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailConfig = getEmailConfig();
    if (!emailConfig) {
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const {
      orderId,
      eventType,
      shopName,
      customerEmail,
      customerName,
      totalAmount,
      items,
      statusUpdate,
      shopOwnerEmail,
      shopOwnerPhone,
    } = await req.json();

    if (!orderId || !eventType) {
      return new Response(
        JSON.stringify({ error: "Missing orderId or eventType" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const shortId = orderId.slice(0, 8).toUpperCase();
    const formattedAmount = `₦${Number(totalAmount || 0).toLocaleString()}`;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if the order is paid and query for any digital product assets
    let isPaid = false;
    let digitalItemsHtml = "";
    try {
      const { data: orderRow } = await supabase
        .from("orders")
        .select("payment_status, status, shops(shop_slug)")
        .eq("id", orderId)
        .maybeSingle();

      const shopSlug = (orderRow?.shops as any)?.shop_slug || null;

      isPaid = orderRow?.payment_status === "paid" || 
               ["confirmed", "processing", "out_for_delivery", "delivered", "completed"].includes(orderRow?.status || statusUpdate || "");

      const { data: orderItems, error: itemsErr } = await supabase
        .from("order_items")
        .select("quantity, price, products(name, is_digital, digital_file_url, digital_delivery_text)")
        .eq("order_id", orderId);

      if (!itemsErr && orderItems && orderItems.length > 0) {
        const digitalItems = orderItems.filter((item: any) => item.products?.is_digital);
        if (digitalItems.length > 0) {
          if (isPaid) {
            digitalItemsHtml = `
              <div style="margin: 20px 0; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 12px; color: #166534; font-size: 16px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                  ⚡ Your Digital Downloads
                </h3>
                <p style="margin: 0 0 16px; color: #1e293b; font-size: 14px;">Your payment has been verified! Click the links below to download your digital products immediately:</p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
            `;

            for (const item of digitalItems) {
              const prod = item.products as any;
              const fileUrl = prod?.digital_file_url || "";
              const deliveryText = prod?.digital_delivery_text || "";
              
              digitalItemsHtml += `
                <div style="padding: 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <p style="margin: 0 0 8px; font-weight: bold; color: #0f172a; font-size: 14px;">${prod?.name || "Digital Item"}</p>
                  ${fileUrl ? `
                    <a href="${fileUrl}" target="_blank" style="display: inline-block; background: #166534; color: #ffffff; padding: 8px 16px; font-size: 13px; font-weight: bold; border-radius: 6px; text-decoration: none; margin-bottom: 8px;">
                      Download File 📥
                    </a>
                  ` : `
                    <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; font-style: italic;">No direct file download link. Access via instructions below.</p>
                  `}
                  ${deliveryText ? `
                    <div style="margin-top: 6px; padding: 8px; background: #f8fafc; border-left: 3px solid #cbd5e1; border-radius: 4px; font-size: 12px; color: #334155; white-space: pre-wrap;">
                      <strong>Instructions:</strong><br/>${deliveryText}
                    </div>
                  ` : ""}
                </div>
              `;
            }

            digitalItemsHtml += `
                </div>
              </div>
            `;
          } else {
            digitalItemsHtml = `
              <div style="margin: 20px 0; padding: 20px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 8px; color: #b45309; font-size: 15px; font-weight: bold;">
                  🔒 Digital Downloads Pending Verification
                </h3>
                <p style="margin: 0; color: #4b5563; font-size: 13px;">
                  Your digital products are ready! The files will become immediately downloadable as soon as the shop owner confirms your payment.
                </p>
              </div>
            `;
          }
        }
      }
    } catch (dbErr) {
      console.error("Non-fatal: failed to check order items for digital assets:", dbErr);
    }

    // Build item list HTML
    const itemsHtml = (items || [])
      .map(
        (item: OrderItem) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₦${Number(item.price * item.quantity).toLocaleString()}</td></tr>`,
      )
      .join("");

    let customerSubject = "";
    let customerBodyHtml = "";
    let ownerSubject = "";
    let ownerBodyHtml = "";

    switch (eventType) {
      case "order_placed":
        customerSubject = `Order Confirmed #${shortId} - ${shopName}`;
        customerBodyHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#16a34a;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="margin:0">Order Confirmed! ✅</h1>
            </div>
            <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
              <p>Hi ${customerName || "Valued Customer"},</p>
              <p>Thank you for your order from <strong>${shopName}</strong>!</p>
              <p><strong>Order ID:</strong> #${shortId}</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <thead><tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Amount</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot><tr><td colspan="2" style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;text-align:right;font-weight:bold">${formattedAmount}</td></tr></tfoot>
              </table>
              <p>The seller will review and process your order shortly.</p>
              ${digitalItemsHtml}
              <p style="color:#6b7280;font-size:12px;margin-top:24px">This is an automated email from SteerSolo. Please do not reply directly.</p>
            </div>
          </div>`;

        ownerSubject = `🛒 New Order #${shortId} - ${formattedAmount}`;
        ownerBodyHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#f97316;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="margin:0">New Order Received! 🎉</h1>
            </div>
            <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
              <p>Hey there,</p>
              <p>You have a new order on <strong>${shopName}</strong>!</p>
              <p><strong>Order ID:</strong> #${shortId}</p>
              <p><strong>Customer:</strong> ${customerName || "N/A"}</p>
              <p><strong>Email:</strong> ${customerEmail || "N/A"}</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <thead><tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Amount</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot><tr><td colspan="2" style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;text-align:right;font-weight:bold">${formattedAmount}</td></tr></tfoot>
              </table>
              <p>Log in to your SteerSolo dashboard to review and process this order.</p>
              <p style="color:#6b7280;font-size:12px;margin-top:24px">This is an automated email from SteerSolo.</p>
            </div>
          </div>`;
        break;

      case "status_update": {
        const statusLabel = (statusUpdate || "").replace(/_/g, " ");
        customerSubject = `Order #${shortId} - ${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}`;
        const statusMessages: Record<string, string> = {
          confirmed:
            "Your order has been confirmed by the seller and will be processed soon.",
          processing: "Your order is now being prepared.",
          out_for_delivery: "Great news! Your order is on its way to you.",
          delivered: "Your order has been delivered. Enjoy!",
          completed: "Your order is complete. Thank you for shopping with us!",
          cancelled:
            "Your order has been cancelled. If you have questions, please contact the seller.",
        };
        const isDelivered = statusUpdate === "delivered";
        const reviewHtml = (isDelivered && shopSlug) ? `
          <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:24px 0;text-align:center;">
            <h3 style="margin:0 0 8px;color:#92400e;">How did we do? ⭐</h3>
            <p style="margin:0 0 16px;color:#92400e;font-size:14px;">Your feedback helps others make great choices. We'd love to see photos of your purchase!</p>
            <a href="https://steersolo.com/shop/${shopSlug}" style="display:inline-block;background:#d97706;color:#ffffff;padding:10px 20px;font-weight:bold;text-decoration:none;border-radius:6px;">Leave a Review</a>
          </div>
        ` : "";

        customerBodyHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#2563eb;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="margin:0">Order Update 📦</h1>
            </div>
            <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
              <p>Hi ${customerName || "Valued Customer"},</p>
              <p><strong>Order #${shortId}</strong> from <strong>${shopName}</strong></p>
              <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin:16px 0">
                <p style="margin:0;font-weight:bold">Status: ${statusLabel.toUpperCase()}</p>
                <p style="margin:8px 0 0;color:#374151">${statusMessages[statusUpdate] || "Your order status has been updated."}</p>
              </div>
              <p>Amount: <strong>${formattedAmount}</strong></p>
              ${digitalItemsHtml}
              ${reviewHtml}
              <p style="color:#6b7280;font-size:12px;margin-top:24px">This is an automated email from SteerSolo.</p>
            </div>
          </div>`;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown event type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Send email to customer
    if (customerEmail && customerSubject) {
      const info = await emailConfig.transporter.sendMail({
        from: emailConfig.from,
        replyTo: emailConfig.replyTo,
        to: customerEmail,
        subject: customerSubject,
        html: customerBodyHtml,
      });
      console.log("Customer order email sent", { eventType, orderId, customerEmail, messageId: info.messageId });
    }

    // Send email to shop owner (for order_placed)
    if (shopOwnerEmail && ownerSubject) {
      const info = await emailConfig.transporter.sendMail({
        from: emailConfig.from,
        replyTo: emailConfig.replyTo,
        to: shopOwnerEmail,
        subject: ownerSubject,
        html: ownerBodyHtml,
      });
      console.log("Shop owner order email sent", { eventType, orderId, shopOwnerEmail, messageId: info.messageId });
    }geId });
    }

    // Send SMS to shop owner via Termii (automatic - no WhatsApp button needed)
    if (eventType === "order_placed" && shopOwnerPhone) {
      const termiiApiKey = Deno.env.get("TERMII_API_KEY");
      if (termiiApiKey) {
        try {
          const itemNames = (items || [])
            .slice(0, 3)
            .map((i: OrderItem) => i.name)
            .join(", ");
          const smsMessage = `SteerSolo: New order #${shortId} (${formattedAmount}) from ${customerName || "a customer"}. Items: ${itemNames}${(items || []).length > 3 ? "..." : ""}. Log in to process.`;

          // Clean phone: ensure it starts with country code
          let phone = shopOwnerPhone.replace(/\s+/g, "").replace(/^0/, "234");
          if (!phone.startsWith("+") && !phone.startsWith("234")) {
            phone = "234" + phone;
          }

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
          console.log("SMS sent to shop owner:", phone);
        } catch (smsErr) {
          console.error("SMS send failed (non-fatal):", smsErr);
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
