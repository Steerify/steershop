const RESEND_API_KEY = "re_bn6nU67z_MpmejFcumyPi5eLzva2UKMG6";
const RECIPIENT = "okechukwuchukwufulumnanya10@gmail.com";
const FROM = "SteerSolo <onboarding@resend.dev>";

async function sendEmail(subject, htmlContent) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM,
        to: [RECIPIENT],
        subject: `[TEST] ${subject}`,
        html: htmlContent
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to send "${subject}":`, errorText);
    } else {
      const data = await response.json();
      console.log(`✅ Successfully sent "${subject}". ID: ${data.id}`);
    }
  } catch (error) {
    console.error(`❌ Network error for "${subject}":`, error.message);
  }
}

async function runTests() {
  console.log("Starting tests for all email service functions...");

  const testCases = [
    {
      subject: "Confirm your SteerSolo account",
      html: `<h1>Welcome to SteerSolo!</h1><p>Please confirm your email by clicking <a href="#">here</a>.</p>`
    },
    {
      subject: "You've been invited to SteerSolo",
      html: `<h1>You're Invited!</h1><p>Join SteerSolo using your invite link.</p>`
    },
    {
      subject: "Your SteerSolo login link",
      html: `<h1>Magic Link Login</h1><p>Click <a href="#">here</a> to log in.</p>`
    },
    {
      subject: "Reset your SteerSolo password",
      html: `<h1>Password Reset</h1><p>Click <a href="#">here</a> to reset your password.</p>`
    },
    {
      subject: "Confirm your new email",
      html: `<h1>Email Change</h1><p>Please confirm your new email address.</p>`
    },
    {
      subject: "Your verification code",
      html: `<h1>Verification Code</h1><p>Your code is: <strong>123456</strong></p>`
    },
    {
      subject: "⏰ Your subscription expires in 3 days - Test Shop",
      html: `<h1>⏰ 3 Days Left!</h1><p>Your subscription is expiring soon. Renew now!</p>`
    },
    {
      subject: "⚠️ Action Required: Your shop Test Shop has been hidden",
      html: `<h1>Shop Hidden</h1><p>Your shop has been temporarily removed due to subscription limits.</p>`
    },
    {
      subject: "Boost Your Sales on Test Shop 📈",
      html: `<h1>Let's Get More Sales!</h1><p>Here are some tips to boost your sales.</p>`
    },
    {
      subject: "Create Your First Store on SteerSolo 🏪",
      html: `<h1>Ready to Start Selling?</h1><p>Create your first store now.</p>`
    }
  ];

  for (const tc of testCases) {
    await sendEmail(tc.subject, tc.html);
  }

  console.log("All tests completed.");
}

runTests();
