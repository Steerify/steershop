import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  phone: string;
  userId: string;
}

// Generate a 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP for storage (simple hash for demo, use bcrypt in production)
const hashOTP = async (otp: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Send phone OTP function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, userId }: SendOTPRequest = await req.json();
    
    if (!phone || !userId) {
      throw new Error("Phone number and user ID are required");
    }

    // Validate Nigerian phone number format
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^0/, '+234');
    if (!/^\+234[0-9]{10}$/.test(cleanPhone)) {
      throw new Error("Invalid Nigerian phone number format");
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limiting
    const { data: rateLimitData } = await supabase
      .from("auth_rate_limits")
      .select("*")
      .eq("identifier", cleanPhone)
      .eq("attempt_type", "phone_otp")
      .single();

    if (rateLimitData) {
      // Check if locked
      if (rateLimitData.locked_until && new Date(rateLimitData.locked_until) > new Date()) {
        const unlockTime = new Date(rateLimitData.locked_until);
        throw new Error(`Too many attempts. Try again after ${unlockTime.toLocaleTimeString()}`);
      }
      
      // Check attempts in last hour
      const lastAttempt = new Date(rateLimitData.last_attempt);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (lastAttempt > oneHourAgo && rateLimitData.attempts >= 5) {
        // Lock for 15 minutes
        await supabase
          .from("auth_rate_limits")
          .update({ locked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString() })
          .eq("id", rateLimitData.id);
        throw new Error("Too many OTP requests. Please try again in 15 minutes.");
      }
    }

    // Generate and hash OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store hashed OTP in profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        phone: cleanPhone,
        phone_verification_code: hashedOTP,
        phone_verification_expires: expiresAt.toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw new Error("Failed to store verification code");
    }

    // Update rate limit tracking
    if (rateLimitData) {
      await supabase
        .from("auth_rate_limits")
        .update({
          attempts: rateLimitData.attempts + 1,
          last_attempt: new Date().toISOString(),
        })
        .eq("id", rateLimitData.id);
    } else {
      await supabase.from("auth_rate_limits").insert({
        identifier: cleanPhone,
        attempt_type: "phone_otp",
        attempts: 1,
        last_attempt: new Date().toISOString(),
      });
    }

    // Check if Termii API key is configured
    const termiiApiKey = Deno.env.get("TERMII_API_KEY");
    
    if (termiiApiKey) {
      // Send OTP via Termii
      const termiiResponse = await fetch("https://api.ng.termii.com/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: cleanPhone,
          from: "SteerSolo",
          sms: `Your SteerSolo verification code is: ${otp}. This code expires in 5 minutes. Do not share this code with anyone.`,
          type: "plain",
          channel: "generic",
          api_key: termiiApiKey,
        }),
      });

      const termiiResult = await termiiResponse.json();
      console.log("Termii response:", termiiResult);

      if (!termiiResponse.ok) {
        throw new Error("Failed to send SMS. Please try again.");
      }
    } else {
      // Development mode - log OTP (REMOVE IN PRODUCTION)
      console.log(`[DEV MODE] OTP for ${cleanPhone}: ${otp}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent",
        expiresIn: 300, // 5 minutes in seconds
        // Only include OTP in dev mode for testing
        ...(termiiApiKey ? {} : { devOtp: otp })
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-phone-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
