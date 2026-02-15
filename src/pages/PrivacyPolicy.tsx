import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  const lastUpdated = "February 15, 2026";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative pt-20 pb-12 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.3} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-primary/10">
            <CardContent className="p-4 sm:p-6 md:p-10 prose prose-slate dark:prose-invert max-w-none leading-relaxed">
              
              <h2 className="font-heading text-2xl font-bold text-primary mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                SteerSolo ("we," "our," or "us"), a product of Steerify Group, is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, website, mobile applications, and related services (collectively, the "Service").
              </p>
              <p className="text-muted-foreground mb-6">
                This policy is designed to comply with the Nigeria Data Protection Regulation (NDPR) 2019, the Nigeria Data Protection Act (NDPA) 2023, and other applicable data protection laws.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">2. Information We Collect</h2>
              
              <h3 className="font-heading text-xl font-semibold mb-3">2.1 Personal Information</h3>
              <p className="text-muted-foreground mb-4">We may collect the following personal information:</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Identity Data:</strong> Full name, date of birth, gender</li>
                <li><strong>Contact Data:</strong> Email address, phone number, delivery address</li>
                <li><strong>Account Data:</strong> Username, password (encrypted), account preferences</li>
                <li><strong>Business Data:</strong> Business name, business registration details (for Entrepreneurs)</li>
                <li><strong>Financial Data:</strong> Bank account details, payment card information (processed securely through Paystack)</li>
                <li><strong>Verification Data:</strong> Bank account verification details, BVN verification status, phone verification data</li>
              </ul>

              <h3 className="font-heading text-xl font-semibold mb-3">2.2 Transaction Data</h3>
              <p className="text-muted-foreground mb-6">
                We collect information about purchases, orders, payments, and delivery details to facilitate transactions between Entrepreneurs and Customers.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">2.3 Usage Data</h3>
              <p className="text-muted-foreground mb-6">
                We automatically collect information about how you interact with our Service, including pages visited, features used, time spent on the platform, and navigation patterns.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">2.4 AI Interaction Data</h3>
              <p className="text-muted-foreground mb-6">
                When you use our AI-powered features (such as "Stroke My Shop," "Know This Shop," AI product descriptions, or AI marketing assistance), we collect the prompts you submit and the responses generated. This data is used to provide the AI service and improve feature quality. <strong>No sensitive personal data beyond your business context</strong> (shop name, product names, business category) is included in AI processing requests.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">2.5 Device and Technical Data</h3>
              <p className="text-muted-foreground mb-6">
                We collect device information including IP address, browser type, operating system, device identifiers, and location data (with your consent).
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Service Delivery:</strong> To provide, maintain, and improve our platform and services</li>
                <li><strong>Account Management:</strong> To create and manage your account, process registrations, and provide customer support</li>
                <li><strong>Transaction Processing:</strong> To process payments, fulfill orders, and facilitate communication between Entrepreneurs and Customers</li>
                <li><strong>AI-Powered Features:</strong> To generate product descriptions, shop descriptions, marketing tips, shop analysis, and other AI-assisted content using third-party AI models</li>
                <li><strong>Communication:</strong> To send service-related notifications, order updates, engagement reminders, and marketing communications (with consent)</li>
                <li><strong>Security:</strong> To detect, prevent, and respond to fraud, abuse, and security threats</li>
                <li><strong>Identity Verification:</strong> To verify user identity through bank account verification and phone number verification for trust and safety</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                <li><strong>Analytics:</strong> To understand usage patterns and improve our services</li>
                <li><strong>Personalization:</strong> To customize your experience and provide relevant recommendations</li>
              </ul>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">4. Legal Basis for Processing (NDPR Compliance)</h2>
              <p className="text-muted-foreground mb-4">Under the Nigeria Data Protection Regulation, we process your personal data on the following legal bases:</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Consent:</strong> Where you have given clear consent for specific purposes</li>
                <li><strong>Contract:</strong> Where processing is necessary to perform our contract with you</li>
                <li><strong>Legal Obligation:</strong> Where we must process data to comply with Nigerian law</li>
                <li><strong>Legitimate Interests:</strong> Where processing is necessary for our legitimate business interests, provided these do not override your rights</li>
              </ul>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">We may share your information with:</p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">5.1 Other Users</h3>
              <p className="text-muted-foreground mb-4">
                When you make a purchase, we share necessary information (name, contact details, delivery address) with the Entrepreneur to fulfill your order. Similarly, Entrepreneurs' store information is visible to Customers.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">5.2 Service Providers</h3>
              <p className="text-muted-foreground mb-4">
                We share data with trusted third-party service providers who assist us in operating our platform, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Paystack:</strong> For payment processing and bank account verification</li>
                <li><strong>Lovable AI:</strong> For AI-powered features including content generation, shop analysis, and marketing assistance</li>
                <li><strong>Resend:</strong> For transactional and marketing email communications</li>
                <li><strong>Termii:</strong> For SMS notifications and phone number verification</li>
                <li><strong>Cloud hosting providers:</strong> For data storage and processing</li>
                <li><strong>Analytics providers:</strong> For platform improvement</li>
              </ul>

              <h3 className="font-heading text-xl font-semibold mb-3">5.3 Legal Requirements</h3>
              <p className="text-muted-foreground mb-6">
                We may disclose your information when required by law, court order, or government request, or when we believe disclosure is necessary to protect our rights, safety, or property.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">6. AI Data Processing</h2>
              <p className="text-muted-foreground mb-4">
                SteerSolo uses AI-powered features to enhance the user experience. When you use these features, your prompts and business context may be processed by third-party AI providers. Important details about AI data processing:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>What is sent:</strong> Business-related context only — such as your shop name, product names, business category, and the specific prompt you provide. <strong>No passwords, payment details, or sensitive personal data</strong> are included in AI requests.</li>
                <li><strong>Processing:</strong> AI prompts are processed by our AI service providers to generate responses. These providers may temporarily process the data but do not use it for their own model training.</li>
                <li><strong>Storage:</strong> AI interaction history (prompts and responses) is stored in our database to provide service continuity and feature improvement.</li>
                <li><strong>Your control:</strong> Use of AI features is optional. You can choose not to use any AI-powered features without affecting your ability to use the core Platform services.</li>
              </ul>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">7. Data Security Measures</h2>
              <p className="text-muted-foreground mb-4">We implement appropriate technical and organizational measures to protect your personal data, including:</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Secure authentication mechanisms including rate limiting and session management</li>
                <li>Row-level security policies on database tables</li>
                <li>Regular security assessments</li>
                <li>Access controls and employee training</li>
                <li>Incident response procedures</li>
                <li>Regular data backups</li>
              </ul>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized content and recommendations</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                You can manage your cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of our Service.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">9. Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">Our platform integrates with the following third-party services:</p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">9.1 Paystack</h3>
              <p className="text-muted-foreground mb-4">
                Payment processing and bank account verification are handled by Paystack. When you make a payment or verify your bank account, your financial information is transmitted directly to Paystack using their secure infrastructure. Please review Paystack's Privacy Policy for information on how they handle your data.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">9.2 WhatsApp</h3>
              <p className="text-muted-foreground mb-4">
                Our platform facilitates communication between Entrepreneurs and Customers via WhatsApp. When you click on WhatsApp links, you will be directed to the WhatsApp application, which is governed by WhatsApp's privacy policy.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">9.3 AI Services (Lovable AI)</h3>
              <p className="text-muted-foreground mb-4">
                AI-powered features such as product description generation, shop analysis ("Know This Shop"), marketing tips ("Stroke My Shop"), and content assistance are powered by Lovable AI. Business context data is shared with this provider to generate responses. See Section 6 for details on AI data processing.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">9.4 Resend</h3>
              <p className="text-muted-foreground mb-4">
                Email communications including order notifications, engagement reminders, and account-related emails are sent through Resend. Your email address and name are shared with Resend for email delivery purposes.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">9.5 Termii</h3>
              <p className="text-muted-foreground mb-6">
                Phone number verification and SMS notifications are handled through Termii. Your phone number is shared with Termii for OTP delivery and verification purposes.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">10. Your Rights Under NDPR</h2>
              <p className="text-muted-foreground mb-4">Under the Nigeria Data Protection Regulation, you have the following rights:</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Right of Access:</strong> You can request a copy of the personal data we hold about you</li>
                <li><strong>Right to Rectification:</strong> You can request correction of inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> You can request deletion of your personal data in certain circumstances</li>
                <li><strong>Right to Restrict Processing:</strong> You can request limitation of how we use your data</li>
                <li><strong>Right to Data Portability:</strong> You can request your data in a structured, commonly used format</li>
                <li><strong>Right to Object:</strong> You can object to certain types of processing, including direct marketing</li>
                <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you can withdraw it at any time</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                To exercise any of these rights, please contact our Data Protection Officer at the contact details provided below.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">11. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Active accounts:</strong> Data is retained for the duration of your account and active use of the Service.</li>
                <li><strong>Deleted accounts:</strong> Upon account deletion, your profile and store data are removed. Your email address is retained in our deletion registry to prevent re-registration abuse. Transaction records are retained for up to 6 years as required by Nigerian financial regulations.</li>
                <li><strong>AI interaction data:</strong> AI prompts and responses are retained for service improvement and may be deleted upon account deletion.</li>
              </ul>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">12. Children's Privacy</h2>
              <p className="text-muted-foreground mb-6">
                Our Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal data from a child without parental consent, we will take steps to delete that information.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">13. International Data Transfers</h2>
              <p className="text-muted-foreground mb-6">
                Your data may be stored and processed in countries outside Nigeria where our service providers operate (including AI processing services, email delivery, and cloud hosting). When we transfer data internationally, we ensure appropriate safeguards are in place to protect your information in accordance with NDPR requirements.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">14. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground mb-6">
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last Updated" date. We encourage you to review this policy periodically.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">15. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions, concerns, or complaints about this Privacy Policy or our data practices, please contact our Data Protection Officer:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg mb-6">
                <p className="text-foreground font-semibold">Data Protection Officer</p>
                <p className="text-foreground">Steerify Group (SteerSolo)</p>
                <p className="text-muted-foreground">Lagos, Nigeria</p>
                <p className="text-muted-foreground">Email: steerifygroup@gmail.com</p>
                <p className="text-muted-foreground">WhatsApp: +234 905 994 7055</p>
              </div>

              <h3 className="font-heading text-xl font-semibold mb-3">Complaints</h3>
              <p className="text-muted-foreground mb-6">
                If you are not satisfied with our response to your concerns, you have the right to lodge a complaint with the National Information Technology Development Agency (NITDA), the regulatory authority responsible for data protection in Nigeria.
              </p>

              <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                <p className="text-foreground font-semibold mb-2">NDPR Compliance Statement</p>
                <p className="text-muted-foreground text-sm">
                  Steerify Group (SteerSolo) is committed to complying with the Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data Protection Act (NDPA) 2023. We have implemented appropriate technical and organizational measures to ensure the protection of your personal data and respect for your privacy rights.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
