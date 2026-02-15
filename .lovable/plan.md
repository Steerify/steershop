
# Update Terms of Service, Privacy Policy, Index Page Images, and Fix Engagement Reminders

## 1. Fix Engagement Reminders Display (Bug)

The engagement reminders edge function works correctly, but the Admin Dashboard reads the response incorrectly.

**The bug:** The edge function returns `{ success: true, results: { incomplete_registration: 0, ... } }` but the dashboard reads `data?.incomplete_registration` instead of `data?.results?.incomplete_registration`.

**File:** `src/pages/admin/AdminDashboard.tsx`
- Change `setReminderResults(data)` to `setReminderResults(data?.results || data)`
- Update the toast to read from `data?.results` as well

This is a one-line fix that makes the results display correctly.

## 2. Update Terms of Service

**File:** `src/pages/TermsOfService.tsx`

Update the date to February 15, 2026 and enhance the content to be more comprehensive and protective:

- **Section 6 (Payments):** Add platform commission clause (2.5% fee on transactions), clarify that SteerSolo is a marketplace facilitator and not responsible for product quality
- **Section 9 (Disputes):** Add a clear escalation process -- seller-buyer first, then SteerSolo mediation, then arbitration
- **Section 10 (Limitation of Liability):** Strengthen the "marketplace only" position -- SteerSolo provides the platform, sellers are responsible for their products/services
- **New Section: AI-Generated Content Disclaimer** -- clarify that AI tools (product descriptions, shop descriptions) are provided as suggestions and the user is responsible for reviewing and approving them
- **New Section: Account Deletion** -- clarify data retention after account deletion (deleted_accounts table blocks re-registration)
- **New Section: Done-For-You Service** -- N5,000 fee is non-refundable once shop is created
- **Update contact info:** Use steerifygroup@gmail.com and the WhatsApp number (2349059947055)

## 3. Update Privacy Policy

**File:** `src/pages/PrivacyPolicy.tsx`

Update the date to February 15, 2026 and enhance:

- **Section 2 (Information We Collect):** Add AI interaction data (prompts sent to AI features like Stroke My Shop, Know This Shop, AI product descriptions)
- **Section 3 (How We Use):** Add "AI-powered features" -- generating descriptions, marketing tips, shop analysis
- **Section 5 (Data Sharing):** Add Lovable AI as a service provider for AI-powered features, add Resend for email communications, add Termii for SMS/phone verification
- **Section 8 (Third-Party Services):** Add Lovable AI (AI features), Resend (email), Termii (SMS verification) alongside existing Paystack and WhatsApp entries
- **New Section: AI Data Processing** -- explain that prompts to AI features may be processed by third-party AI providers, no personal data is included in AI prompts beyond business context
- **Update contact info:** Use steerifygroup@gmail.com and the WhatsApp number

## 4. Add Nigerian Business Images to Index Page

**File:** `src/pages/Index.tsx`

Add a subtle image showcase section between the Hero (Section 1) and the WhySteerSolo component (Section 2). This will be a horizontal strip of 3-4 curated stock images using Unsplash URLs showing:

- A Nigerian woman at a market/shop smiling
- Hands packaging products for delivery
- Someone using a phone for business
- A colorful product display

Implementation:
- A simple horizontal scroll/grid of rounded images with a soft overlay
- Small section, not overwhelming -- just enough to set the vibe
- Use `aspect-ratio` for consistent sizing
- Add a subtle tagline like "Real businesses. Real results."
- Images will use Unsplash URLs (free, no API key needed)
- Responsive: 2 images on mobile, 4 on desktop

## Technical Details

### AdminDashboard.tsx Fix
```text
// Before:
setReminderResults(data);
toast({ description: `Incomplete reg: ${data?.incomplete_registration || 0}...` });

// After:
const results = data?.results || data;
setReminderResults(results);
toast({ description: `Incomplete reg: ${results?.incomplete_registration || 0}...` });
```

### Index.tsx Image Section
A new `NigerianBusinessShowcase` component added between the hero and WhySteerSolo sections. Uses 4 Unsplash images of Nigerian entrepreneurs/markets with rounded corners, subtle shadows, and a "Real businesses. Real results." tagline. Keeps it minimal -- no carousel, just a clean grid.

### Terms of Service Key Additions
- Platform commission disclosure (2.5%)
- AI content disclaimer
- Done-For-You service terms (non-refundable)
- Marketplace facilitator liability protection
- Account deletion and data retention terms

### Privacy Policy Key Additions
- AI data processing transparency
- Complete third-party service provider list (Paystack, WhatsApp, Lovable AI, Resend, Termii)
- NDPR-compliant AI processing disclosure
