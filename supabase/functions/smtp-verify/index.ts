import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const host = Deno.env.get("SMTP_HOST") || "mail.spacemail.com";
  const port = Number(Deno.env.get("SMTP_PORT") || 465);
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASS");
  const from = Deno.env.get("SMTP_FROM_EMAIL") || user;

  if (!user || !pass) {
    return new Response(JSON.stringify({ ok: false, error: "Missing SMTP_USER or SMTP_PASS" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const transporter = nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user, pass },
  });

  try {
    await transporter.verify();
    let sendResult: any = null;
    try {
      const { to } = await req.json().catch(() => ({ to: null }));
      if (to) {
        const info = await transporter.sendMail({
          from, to,
          subject: "SteerSolo SMTP verification",
          text: "If you got this, mail@steersolo.com is sending successfully via mail.spacemail.com.",
        });
        sendResult = { sent: true, messageId: info?.messageId, response: info?.response };
      }
    } catch (e: any) {
      sendResult = { sent: false, error: e?.message };
    }
    return new Response(JSON.stringify({ ok: true, host, port, user, from, sendResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, host, port, user, error: e?.message || String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
