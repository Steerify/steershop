import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);
    const { orderId, eventType, shopName, customerEmail, customerName, totalAmount, items, statusUpdate, shopOwnerEmail } = await req.json();

    if (!orderId || !eventType) {
      return new Response(JSON.stringify({ error: "Missing orderId or eventType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shortId = orderId.slice(0, 8).toUpperCase();
    const formattedAmount = `₦${Number(totalAmount || 0).toLocaleString()}`;

    // Build item list HTML
    const itemsHtml = (items || []).map((item: any) =>
      `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₦${Number(item.price * item.quantity).toLocaleString()}</td></tr>`
    ).join("");

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
              <p style="color:#6b7280;font-size:12px;margin-top:24px">This is an automated email from SteerSolo. Please do not reply directly.</p>
            </div>
          </div>`;

        // Owner notification email
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

      case "status_update":
        const statusLabel = (statusUpdate || "").replace(/_/g, " ");
        customerSubject = `Order #${shortId} - ${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}`;
        
        const statusMessages: Record<string, string> = {
          confirmed: "Your order has been confirmed by the seller and will be processed soon.",
          processing: "Your order is now being prepared.",
          out_for_delivery: "Great news! Your order is on its way to you.",
          delivered: "Your order has been delivered. Enjoy!",
          completed: "Your order is complete. Thank you for shopping with us!",
          cancelled: "Your order has been cancelled. If you have questions, please contact the seller.",
        };

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
              <p style="color:#6b7280;font-size:12px;margin-top:24px">This is an automated email from SteerSolo.</p>
            </div>
          </div>`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown event type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Send email to customer
    if (customerEmail && customerSubject) {
      await resend.emails.send({
        from: "SteerSolo <noreply@steersolo.com>",
        to: [customerEmail],
        subject: customerSubject,
        html: customerBodyHtml,
      });
    }

    // Send email to shop owner (for order_placed)
    if (shopOwnerEmail && ownerSubject) {
      await resend.emails.send({
        from: "SteerSolo <noreply@steersolo.com>",
        to: [shopOwnerEmail],
        subject: ownerSubject,
        html: ownerBodyHtml,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Order notification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
