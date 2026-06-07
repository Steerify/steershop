import fetch from 'node-fetch';
import { config } from 'dotenv';
config({ path: './.env' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error("No RESEND_API_KEY found in .env");
  process.exit(1);
}

async function testResend() {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "SteerSolo <no-reply@steersolo.com>",
      to: "okechukwuchukwufulumnanya10@gmail.com",
      subject: "Test email from SteerShop",
      html: "<p>This is a test email with the steersolo domain.</p>"
    })
  });

  const text = await res.text();
  console.log("Resend API response status:", res.status);
  console.log("Resend API response:", text);
}

testResend();
