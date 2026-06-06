// Email diagnostic + sample sender. Calls Resend directly so we can see exactly
// what the provider says (verified domain, key scope, deliverability).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRIMARY_FROM = "SteerSolo <no-reply@steersolo.com>";
const FALLBACK_FROM = "SteerSolo <onboarding@resend.dev>";

async function sendViaResend(apiKey: string, from: string, to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  const text = await res.text();
  let body: any = text;
  try { body = JSON.parse(text); } catch { /* keep raw */ }
  return { ok: res.ok, status: res.status, from, body };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "RESEND_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let to = "okechukwuchukwufulumnanya10@gmail.com";
    let subject = "SteerSolo email delivery test";
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (typeof body?.to === "string") to = body.to;
        if (typeof body?.subject === "string") subject = body.subject;
      } catch { /* ignore */ }
    }

    const html = `
      <div style="font-family:Poppins,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;color:#0F172A">
        <h1 style="margin:0 0 12px;color:hsl(215,65%,25%);font-weight:800">SteerSolo email is live</h1>
        <p style="margin:0 0 12px;line-height:1.5">Hi there,</p>
        <p style="margin:0 0 12px;line-height:1.5">
          This is an automated delivery test from SteerSolo confirming that our Resend pipeline is sending
          successfully. If you can read this, our authentication, notification, and order emails are reaching inboxes.
        </p>
        <p style="margin:0 0 16px;line-height:1.5">Sent at <strong>${new Date().toISOString()}</strong>.</p>
        <a href="https://steersolo.com" style="display:inline-block;background:hsl(215,65%,25%);color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Visit SteerSolo</a>
        <p style="margin:24px 0 0;color:#64748B;font-size:12px">SteerSolo · steersolo.com</p>
      </div>
    `;

    // Try primary verified domain first
    let result = await sendViaResend(apiKey, PRIMARY_FROM, to, subject, html);
    let usedFallback = false;
    if (!result.ok) {
      // If domain not verified or key scoped elsewhere, retry with onboarding@resend.dev
      const msg = JSON.stringify(result.body).toLowerCase();
      if (msg.includes("not verified") || msg.includes("domain") || msg.includes("forbidden") || result.status === 403) {
        const fb = await sendViaResend(apiKey, FALLBACK_FROM, to, subject, html);
        usedFallback = true;
        return new Response(
          JSON.stringify({
            ok: fb.ok,
            primary_attempt: result,
            fallback_attempt: fb,
            used_fallback: usedFallback,
            recipient: to,
            note: "Primary domain rejected. Fallback sender used. Verify steersolo.com in Resend dashboard to use branded sender.",
          }),
          { status: fb.ok ? 200 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(
      JSON.stringify({ ok: result.ok, attempt: result, recipient: to, used_fallback: false }),
      { status: result.ok ? 200 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("email-diagnostic error", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
