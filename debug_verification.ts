import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://hwkcqgmtinbgyjjgcgmp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3a2NxZ210aW5iZ3lqamdjZ21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mzg2NDMsImV4cCI6MjA3ODIxNDY0M30.DteckGKDVYtq-fwPn24qgas0qg9CKOswAPkZuigre2U";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTest() {
  console.log("=== Starting Verification Debug Test ===");

  // 1. Create Test User
  const email = `test.debug.${Date.now()}@example.com`;
  const password = "Password123!";
  console.log(`\n[Step 1] Creating test user: ${email}`);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            full_name: "Debug Tester",
            role: "customer"
        }
    }
  });

  if (signUpError) {
    console.error("❌ FAILED to sign up:", signUpError.message);
    return;
  }
  
  if (!signUpData.session) {
      console.log("⚠️ Signed up, but no session returned. Attempting to sign in (check if email confirmation is enabled)...");
  }

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    console.error("❌ FAILED to login:", loginError.message); 
    console.log("Note: If email confirmation is required, this test cannot proceed fully.");
    return;
  }

  console.log("✅ Login successful. Authenticated as:", loginData.user.id);

  // 2. Test Phone Verification
  console.log("\n[Step 2] Testing Phone Verification (Send OTP)...");
  const phone = "08012345678"; // Valid Nigerian format

  const { data: sendData, error: sendError } = await supabase.functions.invoke("send-phone-otp", {
    body: { phone, userId: loginData.user.id }, 
  });

  if (sendError) {
      console.error("❌ FAILED to invoke send-phone-otp:");
      try {
          if (sendError.context && typeof sendError.context.json === 'function') {
            const errorBody = await sendError.context.json();
            console.error("Error Body:", errorBody);
          } else {
             console.error(sendError);
          }
        } catch (e) {
             console.error(sendError);
        }
  } else {
      console.log("✅ Send OTP Response:", sendData);
  }

  if (sendData && sendData.success && sendData.devOtp) {
      console.log(`\n> Got DEV OTP: ${sendData.devOtp}`);
      
      console.log("\n[Step 3] Testing Phone Verification (Verify OTP)...");
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-phone-otp", {
        body: { otp: sendData.devOtp, userId: loginData.user.id },
      });

      if (verifyError) {
          console.error("❌ FAILED to invoke verify-phone-otp:", verifyError);
           try {
              if (verifyError.context && typeof verifyError.context.json === 'function') {
                console.error("Error Body:", await verifyError.context.json());
              }
           } catch(e) {}
      } else {
          console.log("✅ Verify OTP Response:", verifyData);
      }

  } else {
      console.log("\n⚠️ SKIPPING Verify OTP step (no devOtp returned or send failed).");
  }

  // 3. Test KYC
  console.log("\n[Step 4] Testing Identity Verification (Level 1 - BVN)...");
  // Using a potentially invalid BVN just to see if connection works. 
  // Paystack might return "BVN not found" or similar, but NOT "Network Error".
  const bvnData = {
      type: "level1",
      bvn: "12345678901", 
      firstName: "Test",
      lastName: "User"
  };

  const { data: kycData, error: kycError } = await supabase.functions.invoke("verify-identity", {
      body: bvnData,
  });

  if (kycError) {
      console.error("❌ FAILED to invoke verify-identity:");
      try {
          if (kycError.context && typeof kycError.context.json === 'function') {
            const errorBody = await kycError.context.json();
            console.error("Error Body:", errorBody);
          } else {
            console.error(kycError);
          }
        } catch (e) {
            console.error(kycError);
        }
  } else {
      console.log("✅ KYC Response:", kycData);
  }

  console.log("\n=== Test Completed ===");
}

runTest();
