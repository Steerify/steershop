import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  console.log("=== Send phone OTP function called ===");
  console.log("Request method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body received:", { phone: requestBody.phone, userId: requestBody.userId?.slice(0, 8) + "..." });
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      throw new Error("Invalid request body. Please provide phone and userId.");
    }

    const { phone, userId }: SendOTPRequest = requestBody;
    
    if (!phone || !userId) {
      console.error("Missing required fields:", { hasPhone: !!phone, hasUserId: !!userId });
      throw new Error("Phone number and user ID are required");
    }

    // Validate Nigerian phone number format
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^0/, '+234');
    console.log("Cleaned phone number:", cleanPhone);
    
    if (!/^\+234[0-9]{10}$/.test(cleanPhone)) {
      console.error("Invalid phone format:", cleanPhone);
      throw new Error("Invalid Nigerian phone number format. Please use format: 08012345678");
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

    // Verify user exists
    console.log("Verifying user exists...");
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("id", userId)
      .single();

    if (profileCheckError) {
      console.error("Profile check error:", profileCheckError);
      throw new Error("User not found. Please log in again.");
    }
    console.log("User verified:", existingProfile.email);

    // Check rate limiting
    console.log("Checking rate limits...");
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from("auth_rate_limits")
      .select("*")
      .eq("identifier", cleanPhone)
      .eq("attempt_type", "phone_otp")
      .maybeSingle();

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      // Continue anyway - rate limiting is not critical
    }

    if (rateLimitData) {
      console.log("Rate limit data found:", { attempts: rateLimitData.attempts, locked_until: rateLimitData.locked_until });
      
      // Check if locked
      if (rateLimitData.locked_until && new Date(rateLimitData.locked_until) > new Date()) {
        const unlockTime = new Date(rateLimitData.locked_until);
        console.error("User is locked until:", unlockTime);
        throw new Error(`Too many attempts. Try again after ${unlockTime.toLocaleTimeString()}`);
      }
      
      // Check attempts in last hour
      const lastAttempt = new Date(rateLimitData.last_attempt);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (lastAttempt > oneHourAgo && rateLimitData.attempts >= 5) {
        console.log("Max attempts reached, locking user...");
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
    console.log("Generated OTP, expires at:", expiresAt.toISOString());

    // Store hashed OTP in profile
    console.log("Storing OTP in profile...");
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
      throw new Error("Failed to store verification code. Please try again.");
    }
    console.log("OTP stored successfully");

    // Update rate limit tracking
    console.log("Updating rate limits...");
    if (rateLimitData) {
      const { error: updateRateLimitError } = await supabase
        .from("auth_rate_limits")
        .update({
          attempts: rateLimitData.attempts + 1,
          last_attempt: new Date().toISOString(),
        })
        .eq("id", rateLimitData.id);
        
      if (updateRateLimitError) {
        console.error("Error updating rate limit:", updateRateLimitError);
        // Non-critical, continue
      }
    } else {
      const { error: insertRateLimitError } = await supabase
        .from("auth_rate_limits")
        .insert({
          identifier: cleanPhone,
          attempt_type: "phone_otp",
          attempts: 1,
          last_attempt: new Date().toISOString(),
        });
        
      if (insertRateLimitError) {
        console.error("Error inserting rate limit:", insertRateLimitError);
        // Non-critical, continue
      }
    }

    // Check if Termii API key is configured
    const termiiApiKey = Deno.env.get("TERMII_API_KEY");
    
    if (termiiApiKey && termiiApiKey.length > 10) {
      console.log("Sending OTP via Termii...");
      try {
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
        console.log("Termii response status:", termiiResponse.status);
        console.log("Termii response:", JSON.stringify(termiiResult));

        if (!termiiResponse.ok) {
          console.error("Termii API error:", termiiResult);
          throw new Error("Failed to send SMS. Please try again.");
        }
      } catch (termiiError) {
        console.error("Termii API call failed:", termiiError);
        throw new Error("SMS service unavailable. Please try again later.");
      }
    } else {
      // Development mode - log OTP
      console.log(`[DEV MODE] =====================`);
      console.log(`[DEV MODE] OTP for ${cleanPhone}: ${otp}`);
      console.log(`[DEV MODE] =====================`);
    }

    console.log("=== OTP sent successfully ===");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent to your phone",
        expiresIn: 300, // 5 minutes in seconds
        // Only include OTP in dev mode for testing
        ...(termiiApiKey && termiiApiKey.length > 10 ? {} : { devOtp: otp })
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("=== Error in send-phone-otp function ===");
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
