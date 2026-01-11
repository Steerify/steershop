import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hwkcqgmtinbgyjjgcgmp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3a2NxZ210aW5iZ3lqamdjZ21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mzg2NDMsImV4cCI6MjA3ODIxNDY0M30.DteckGKDVYtq-fwPn24qgas0qg9CKOswAPkZuigre2U";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTest() {
    console.log("=== Starting Verification Debug Test (Node.js) ===");

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

    // Try to login immediately
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (loginError) {
        console.error("❌ FAILED to login:", loginError.message);
        return;
    }

    console.log("✅ Login successful. Authenticated as:", loginData.user.id);

    // 2. Test Phone Verification (Scenario: Network / Functions)
    console.log("\n[Step 2] Testing Phone Verification (Send OTP)...");
    const phone = "08012345678";

    const { data: sendData, error: sendError } = await supabase.functions.invoke("send-phone-otp", {
        body: { phone, userId: loginData.user.id },
    });

    if (sendError) {
        console.error("❌ FAILED to invoke send-phone-otp:", sendError);
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
        } else {
            console.log("✅ Verify OTP Response:", verifyData);
        }

    } else {
        console.log("\n⚠️ SKIPPING Verify OTP step (no devOtp returned or send failed).");
    }

    // 3. Test KYC
    console.log("\n[Step 4] Testing Identity Verification (Level 1 - BVN)...");
    // Using invalid BVN to test connection
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
        console.error("❌ FAILED to invoke verify-identity:", kycError);
    } else {
        console.log("✅ KYC Response:", kycData);
    }

    console.log("\n=== Test Completed ===");
}

runTest();
