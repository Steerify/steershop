import * as dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: 'supabase/functions/.env' });

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error("Missing RESEND_API_KEY in .env");
  process.exit(1);
}

async function sendTestEmail() {
  console.log("Sending test email via Resend API...");
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SteerSolo <onboarding@resend.dev>',
        to: 'steerifygroup@gmail.com',
        subject: 'Test Email from SteerSolo (Resend)',
        html: '<strong>It works!</strong><br><p>This is a test email triggered by your AI assistant.</p>'
      })
    });
    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

sendTestEmail();
