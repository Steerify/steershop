import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Parse the payload from Supabase
    const payload = await req.json();
    
    // Supabase sends standard SMS webhook payload containing user and sms details
    // Reference: https://supabase.com/docs/guides/auth/auth-sms#send-sms-hook
    const { phone, sms } = payload;

    if (!phone || !sms) {
      return new Response(
        JSON.stringify({ error: 'Missing phone number or SMS content' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve Termii credentials from Edge Function secrets
    const TERMII_API_KEY = Deno.env.get('TERMII_API_KEY');
    const TERMII_SENDER_ID = Deno.env.get('TERMII_SENDER_ID') || 'SteerSolo';

    if (!TERMII_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Termii API Key is not configured in secrets' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Make the request to Termii's Messaging API
    const termiiResponse = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phone.startsWith('+') ? phone.substring(1) : phone, // Termii prefers numbers without the '+' sign
        from: TERMII_SENDER_ID,
        sms: sms,
        type: "plain",
        channel: "generic", // Change to "dnd" if your Sender ID requires the DND route in Nigeria
        api_key: TERMII_API_KEY,
      }),
    });

    const termiiResult = await termiiResponse.json();

    if (!termiiResponse.ok) {
      console.error('Termii API Error:', termiiResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send SMS via Termii', details: termiiResult }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'SMS sent successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
})
