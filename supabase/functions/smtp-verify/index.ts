import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getTransporter, getDefaultFromEmail } from "../_shared/smtp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  try {
    const transporter = await getTransporter();
    const from = getDefaultFromEmail();
    
    let sendResult: any = null;
    try {
      const { to } = await req.json().catch(() => ({ to: null }));
      if (to) {
        const info = await transporter.sendMail({
          from, 
          to: Array.isArray(to) ? to : [to],
          subject: "SteerSolo Email Verification Test",
          text: "If you got this, your email configuration (Resend/SMTP) is working successfully.",
        });
        sendResult = { sent: true, messageId: info?.messageId, response: info?.response };
      }
    } catch (e: any) {
      sendResult = { sent: false, error: e?.message };
    }

    const provider = Deno.env.get("RESEND_API_KEY") ? "Resend API" : "SMTP";
    return new Response(JSON.stringify({ ok: true, provider, from, sendResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
