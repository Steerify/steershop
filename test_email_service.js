import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function runTest() {
  console.log("=== SteerSolo Professional Email Service Test ===");
  console.log("This tool will test the Resend API integration we just set up.\n");

  let resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.log("⚠️ No RESEND_API_KEY found in your local .env file.");
    resendKey = await askQuestion("Please enter your Resend API Key (starts with 're_'): ");
  }

  if (!resendKey || !resendKey.startsWith('re_')) {
    console.error("❌ Invalid API Key. Resend keys must start with 're_'.");
    rl.close();
    return;
  }

  const recipient = await askQuestion("Enter recipient email to send a test message to: ");
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'onboarding@resend.dev';

  console.log("\nConfigured Email Settings:");
  console.log(`- Provider: Resend API`);
  console.log(`- Sender (From): ${fromEmail}`);
  console.log(`- Recipient: ${recipient}`);
  console.log("Connecting to Resend...\n");

  try {
    console.log("[Step 1/1] Sending test email via Resend API...");
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `SteerSolo Test <${fromEmail}>`,
        to: [recipient],
        subject: "SteerSolo Email Service Test: SUCCESS ✅",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
            <h2 style="color: #10b981; margin-top: 0;">Resend Integration Successful! 🎉</h2>
            <p>This is a test message from your new SteerSolo email configuration.</p>
            <p>If you are receiving this, your Edge Functions are now completely disconnected from Lovable/Spacemail and are running professionally via Resend.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-size: 12px; color: #64748b;">Ready to launch your app.</p>
          </div>
        `,
        text: "Verification Successful! This is a test message from your SteerSolo Resend script."
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Test email sent successfully!");
    console.log(`- Message ID: ${data.id}`);
    console.log("\nEverything is working smoothly! You will now receive verification emails correctly.");
  } catch (error) {
    console.error("\n❌ Email sending FAILED!");
    console.error("Error details:", error.message);
    console.log("\nTroubleshooting tips:");
    console.log("1. Ensure your API key is correct.");
    console.log("2. If using 'onboarding@resend.dev' as sender, you can only send to the email address registered to your Resend account.");
    console.log("3. To send to anyone, verify your custom domain in the Resend dashboard.");
  } finally {
    rl.close();
  }
}

runTest();
