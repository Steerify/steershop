import nodemailer from 'nodemailer';
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
  console.log("=== SteerSolo SMTP Mail Service Verification Tool ===");
  console.log("This tool will run a direct connection test to Spaceship/Spacemail SMTP servers.\n");

  let host = process.env.SMTP_HOST || 'mail.spacemail.com';
  let port = process.env.SMTP_PORT || '465';
  let user = process.env.SMTP_USER || 'mail@steersolo.com';
  let from = process.env.SMTP_FROM_EMAIL || 'mail@steersolo.com';
  let pass = process.env.SMTP_PASS;

  if (!pass) {
    console.log("No SMTP_PASS found in environment variables.");
    pass = await askQuestion("Please enter your Spacemail Password: ");
  }

  const recipient = await askQuestion("Enter recipient email to send a test message to: ");

  console.log("\nConfigured SMTP Settings:");
  console.log(`- Host: ${host}`);
  console.log(`- Port: ${port}`);
  console.log(`- User: ${user}`);
  console.log(`- Sender (From): ${from}`);
  console.log(`- Recipient: ${recipient}`);
  console.log("Connecting...");

  const portNum = parseInt(port, 10);
  const transporter = nodemailer.createTransport({
    host,
    port: portNum,
    secure: portNum === 465,
    auth: {
      user,
      pass
    },
    timeout: 10000 // 10s timeout
  });

  try {
    // 1. Verify connection configuration
    console.log("\n[Step 1/2] Verifying server connection credentials...");
    await transporter.verify();
    console.log("✅ SMTP Server Connection: SUCCESSFUL!");

    // 2. Send test email
    console.log("\n[Step 2/2] Sending test email...");
    const info = await transporter.sendMail({
      from: `SteerSolo Verification <${from}>`,
      to: recipient,
      subject: "SteerSolo Mail Service Test: SUCCESS",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
          <h2 style="color: #10b981; margin-top: 0;">Verification Successful! 🎉</h2>
          <p>This is a test message from your SteerSolo SMTP verification script.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="font-size: 12px; color: #64748b;">If you received this, your Spacemail/Spaceship configuration is working perfectly.</p>
        </div>
      `,
      text: "Verification Successful! This is a test message from your SteerSolo SMTP verification script."
    });

    console.log("✅ Test email sent successfully!");
    console.log(`- Message ID: ${info.messageId}`);
    console.log(`- Response: ${info.response}`);
    console.log("\nEverything is working smoothly! All services are operational.");
  } catch (error) {
    console.error("\n❌ SMTP Connection FAILED!");
    console.error("Error details:", error.message);
    console.log("\nTroubleshooting tips:");
    console.log("1. Check if the Spacemail Password is correct.");
    console.log("2. Ensure port 465 is not blocked on your network/firewall.");
    console.log("3. Verify your custom domain mail records (SPF/DKIM) on Spaceship.");
  } finally {
    rl.close();
  }
}

runTest();
