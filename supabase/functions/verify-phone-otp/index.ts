import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  otp: string;
  userId: string;
}

// Hash OTP for comparison (must match send-phone-otp function)
const hashOTP = async (otp: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Verify phone OTP function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { otp, userId }: VerifyOTPRequest = await req.json();
    
    if (!otp || !userId) {
      throw new Error("OTP and user ID are required");
    }

    // Validate OTP format (6 digits)
    if (!/^[0-9]{6}$/.test(otp)) {
      throw new Error("Invalid OTP format");
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's stored verification data
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("phone, phone_verification_code, phone_verification_expires")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      console.error("Error fetching profile:", fetchError);
      throw new Error("User not found");
    }

    // Check if OTP has expired
    if (!profile.phone_verification_expires) {
      throw new Error("No verification code found. Please request a new one.");
    }

    const expiresAt = new Date(profile.phone_verification_expires);
    if (expiresAt < new Date()) {
      // Clear expired code
      await supabase
        .from("profiles")
        .update({
          phone_verification_code: null,
          phone_verification_expires: null,
        })
        .eq("id", userId);
      throw new Error("Verification code has expired. Please request a new one.");
    }

    // Hash and compare OTP
    const hashedOTP = await hashOTP(otp);
    
    if (hashedOTP !== profile.phone_verification_code) {
      // Track failed attempts for rate limiting
      const { data: rateLimitData } = await supabase
        .from("auth_rate_limits")
        .select("*")
        .eq("identifier", profile.phone)
        .eq("attempt_type", "phone_verify")
        .single();

      if (rateLimitData) {
        const newAttempts = rateLimitData.attempts + 1;
        
        if (newAttempts >= 3) {
          // Max attempts reached, clear code and lock
          await supabase
            .from("profiles")
            .update({
              phone_verification_code: null,
              phone_verification_expires: null,
            })
            .eq("id", userId);
          
          await supabase
            .from("auth_rate_limits")
            .update({
              attempts: newAttempts,
              locked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            })
            .eq("id", rateLimitData.id);
          
          throw new Error("Too many failed attempts. Please request a new code.");
        }
        
        await supabase
          .from("auth_rate_limits")
          .update({ attempts: newAttempts })
          .eq("id", rateLimitData.id);
      } else {
        await supabase.from("auth_rate_limits").insert({
          identifier: profile.phone,
          attempt_type: "phone_verify",
          attempts: 1,
        });
      }
      
      throw new Error("Invalid verification code");
    }

    // OTP is valid - mark phone as verified
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        phone_verified: true,
        phone_verification_code: null,
        phone_verification_expires: null,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating verification status:", updateError);
      throw new Error("Failed to verify phone number");
    }

    // Clean up rate limit tracking
    await supabase
      .from("auth_rate_limits")
      .delete()
      .eq("identifier", profile.phone)
      .in("attempt_type", ["phone_otp", "phone_verify"]);

    console.log(`Phone verified successfully for user: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Phone number verified successfully",
        phone: profile.phone,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-phone-otp function:", error);
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
