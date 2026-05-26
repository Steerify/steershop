import crypto from 'crypto';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function runTest() {
  console.log("=== SteerSolo Paystack Escrow Webhook Tester ===");
  console.log("This utility generates verified signatures and test payloads for the SteerSolo escrow webhook.\n");

  const secretKey = await askQuestion("Enter your PAYSTACK_SECRET_KEY (or press Enter for standard mock key): ") || "sk_test_mock_secret_key_12345";
  const orderId = await askQuestion("Enter a mock Order ID to target (e.g. 550e8400-e29b-41d4-a716-446655440000): ") || "550e8400-e29b-41d4-a716-446655440000";
  const localUrl = await askQuestion("Enter your local/live Webhook Endpoint URL: ") || "http://localhost:54321/functions/v1/paystack-escrow-webhook";

  // Create the standard Paystack event payload
  const payload = {
    event: "charge.success",
    data: {
      id: 301234567,
      domain: "test",
      status: "success",
      reference: "steer_ref_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      amount: 1500000, // 15,000 NGN (in kobo)
      currency: "NGN",
      channel: "card",
      metadata: {
        order_id: orderId,
        custom_fields: [
          {
            display_name: "Platform",
            variable_name: "platform",
            value: "SteerSolo"
          }
        ]
      }
    }
  };

  const payloadString = JSON.stringify(payload);

  // Compute the expected x-paystack-signature header
  const hmac = crypto.createHmac('sha512', secretKey);
  hmac.update(payloadString);
  const signature = hmac.digest('hex');

  console.log("\n✅ Generated Mock Paystack Payload & Signature successfully!");
  console.log("-----------------------------------------------------------------");
  console.log(`\nHeader [x-paystack-signature]:\n${signature}`);
  console.log(`\nPayload (JSON):\n${payloadString}`);
  console.log("\n-----------------------------------------------------------------");

  console.log("\n🚀 Testing Instructions:");
  console.log("1. Run your local Deno edge function using:");
  console.log("   supabase start");
  console.log("2. Fire this request directly to your local endpoint using this cURL command:");
  console.log("\n--- COPY AND RUN THIS CURL COMMAND ---");
  console.log(`curl -X POST "${localUrl}" \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -H "x-paystack-signature: ${signature}" \\`);
  console.log(`  -d '${payloadString}'`);
  console.log("--------------------------------------");

  rl.close();
}

runTest();
