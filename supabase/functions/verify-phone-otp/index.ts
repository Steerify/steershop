import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  console.log("=== Verify phone OTP function called ===");
  console.log("Request method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body received:", { otp: "***", userId: requestBody.userId?.slice(0, 8) + "..." });
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      throw new Error("Invalid request body. Please provide OTP and userId.");
    }

    const { otp, userId }: VerifyOTPRequest = requestBody;
    
    if (!otp || !userId) {
      console.error("Missing required fields:", { hasOtp: !!otp, hasUserId: !!userId });
      throw new Error("OTP and user ID are required");
    }

    // Validate OTP format (6 digits)
    if (!/^[0-9]{6}$/.test(otp)) {
      console.error("Invalid OTP format received");
      throw new Error("Invalid OTP format. Please enter a 6-digit code.");
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      throw new Error("Server configuration error. Please try again later.");
    }
    
    console.log("Initializing Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's stored verification data
    console.log("Fetching profile data...");
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("phone, phone_verification_code, phone_verification_expires, email")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
      throw new Error("User not found. Please log in again.");
    }
    
    if (!profile) {
      console.error("No profile found for user");
      throw new Error("User not found. Please log in again.");
    }
    
    console.log("Profile found for:", profile.email);

    // Check if OTP has expired
    if (!profile.phone_verification_expires || !profile.phone_verification_code) {
      console.error("No verification code found in profile");
      throw new Error("No verification code found. Please request a new one.");
    }

    const expiresAt = new Date(profile.phone_verification_expires);
    console.log("OTP expires at:", expiresAt.toISOString(), "Current time:", new Date().toISOString());
    
    if (expiresAt < new Date()) {
      console.log("OTP has expired, clearing...");
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
    console.log("Hashing and comparing OTP...");
    const hashedOTP = await hashOTP(otp);
    
    if (hashedOTP !== profile.phone_verification_code) {
      console.log("OTP mismatch");
      
      // Track failed attempts for rate limiting
      const { data: rateLimitData, error: rateLimitError } = await supabase
        .from("auth_rate_limits")
        .select("*")
        .eq("identifier", profile.phone)
        .eq("attempt_type", "phone_verify")
        .maybeSingle();

      if (rateLimitError) {
        console.error("Rate limit check error:", rateLimitError);
        // Continue anyway
      }

      if (rateLimitData) {
        const newAttempts = rateLimitData.attempts + 1;
        console.log("Failed attempts count:", newAttempts);
        
        if (newAttempts >= 3) {
          console.log("Max attempts reached, clearing code and locking...");
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
      
      throw new Error("Invalid verification code. Please check and try again.");
    }

    console.log("OTP verified successfully!");
    
    // OTP is valid - mark phone as verified
    console.log("Marking phone as verified...");
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
      throw new Error("Failed to verify phone number. Please try again.");
    }

    // Clean up rate limit tracking
    console.log("Cleaning up rate limit records...");
    const { error: cleanupError } = await supabase
      .from("auth_rate_limits")
      .delete()
      .eq("identifier", profile.phone)
      .in("attempt_type", ["phone_otp", "phone_verify"]);

    if (cleanupError) {
      console.error("Error cleaning up rate limits:", cleanupError);
      // Non-critical, continue
    }

    console.log("=== Phone verified successfully ===");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Phone number verified successfully!",
        phone: profile.phone,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("=== Error in verify-phone-otp function ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred. Please try again.",
        success: false 
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
