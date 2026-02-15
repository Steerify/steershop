import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const TermsOfService = () => {
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
              Terms of Service
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
              
              <h2 className="font-heading text-2xl font-bold text-primary mb-4">1. Introduction and Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to SteerSolo ("we," "our," or "us"), a product of Steerify Group. These Terms of Service ("Terms") govern your access to and use of the SteerSolo platform, website, mobile applications, and all related services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
              </p>
              <p className="text-muted-foreground mb-6">
                SteerSolo is a Nigerian-based e-commerce marketplace platform designed to empower solo entrepreneurs by providing them with tools to create professional online stores, manage products, process orders, and connect with customers. SteerSolo acts as a <strong>marketplace facilitator</strong> — we provide the technology platform but do not manufacture, warehouse, or sell any products listed by Entrepreneurs.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>"Platform"</strong> refers to the SteerSolo website, mobile applications, and all associated services.</li>
                <li><strong>"Entrepreneur"</strong> or <strong>"Seller"</strong> refers to any individual or entity that creates a store on our Platform to sell products or services.</li>
                <li><strong>"Customer"</strong> or <strong>"Buyer"</strong> refers to any individual or entity that browses, purchases, or interacts with stores on our Platform.</li>
                <li><strong>"User"</strong> refers to any person who accesses or uses our Platform, including both Entrepreneurs and Customers.</li>
                <li><strong>"Store"</strong> refers to the online storefront created by an Entrepreneur on our Platform.</li>
                <li><strong>"Content"</strong> refers to all text, images, videos, product listings, reviews, and other materials uploaded or posted on the Platform.</li>
                <li><strong>"AI-Generated Content"</strong> refers to text, descriptions, or suggestions produced by AI features on the Platform, including but not limited to product descriptions, shop descriptions, and marketing tips.</li>
              </ul>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">3. User Account Registration</h2>
              <h3 className="font-heading text-xl font-semibold mb-3">3.1 Eligibility</h3>
              <p className="text-muted-foreground mb-4">
                To use our Service, you must be at least 18 years old or have reached the age of majority in your jurisdiction. By registering for an account, you represent and warrant that you meet these eligibility requirements.
              </p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">3.2 Account Creation</h3>
              <p className="text-muted-foreground mb-4">
                When you create an account, you must provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">3.3 Account Security</h3>
              <p className="text-muted-foreground mb-4">
                You agree to immediately notify us of any unauthorized use of your account or any other breach of security. We will not be liable for any loss or damage arising from your failure to protect your account credentials.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">3.4 One Account Per User</h3>
              <p className="text-muted-foreground mb-6">
                Each user may maintain only one account. Creating multiple accounts to circumvent platform rules, bans, or restrictions is prohibited and may result in permanent suspension of all associated accounts.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">4. Entrepreneur Responsibilities</h2>
              <h3 className="font-heading text-xl font-semibold mb-3">4.1 Store Operation</h3>
              <p className="text-muted-foreground mb-4">
                As an Entrepreneur, you are solely responsible for the operation of your store, including but not limited to product listings, pricing, inventory management, order fulfillment, customer service, and compliance with applicable laws.
              </p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">4.2 Product Listings</h3>
              <p className="text-muted-foreground mb-4">
                You must ensure that all product listings are accurate, complete, and not misleading. You may not list any products that are illegal, counterfeit, stolen, or prohibited by Nigerian law or our policies. You are solely responsible for the accuracy of all product descriptions, whether written by you or generated using our AI tools.
              </p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">4.3 Order Fulfillment</h3>
              <p className="text-muted-foreground mb-4">
                You are responsible for fulfilling orders in a timely manner and in accordance with the terms you have communicated to customers. Failure to fulfill orders may result in account suspension or termination.
              </p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">4.4 Taxes and Legal Compliance</h3>
              <p className="text-muted-foreground mb-6">
                You are solely responsible for determining and paying all applicable taxes on your sales. You must comply with all Nigerian laws and regulations applicable to your business, including but not limited to consumer protection laws, tax laws, and product safety regulations.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">5. Customer Responsibilities</h2>
              <p className="text-muted-foreground mb-6">
                As a Customer, you agree to provide accurate information when placing orders, pay for products you order, and communicate respectfully with Entrepreneurs. You understand that transactions are between you and the Entrepreneur, and that SteerSolo facilitates but is not a party to these transactions. SteerSolo does not guarantee the quality, safety, or legality of products listed by Entrepreneurs.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">6. Payment Terms, Fees, and Platform Commission</h2>
              <h3 className="font-heading text-xl font-semibold mb-3">6.1 Subscription Fees</h3>
              <p className="text-muted-foreground mb-4">
                Entrepreneurs may be required to pay subscription fees to access certain features. Current pricing is displayed on our website. We reserve the right to modify pricing with reasonable notice.
              </p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">6.2 Platform Commission</h3>
              <p className="text-muted-foreground mb-4">
                SteerSolo charges a platform commission of <strong>2.5%</strong> on each successful transaction processed through the Platform. This commission is automatically deducted from the transaction amount before settlement to the Entrepreneur. The commission covers platform maintenance, payment processing infrastructure, and ongoing feature development. We reserve the right to modify this rate with at least 30 days' notice to Entrepreneurs.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">6.3 Payment Processing</h3>
              <p className="text-muted-foreground mb-4">
                Payments are processed through our third-party payment processor, Paystack. By using our payment services, you also agree to Paystack's terms of service. We do not store your complete payment information. Paystack may charge additional processing fees as per their own pricing schedule.
              </p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">6.4 Marketplace Facilitator Disclaimer</h3>
              <p className="text-muted-foreground mb-4">
                SteerSolo is a marketplace facilitator and technology platform provider. We are <strong>not</strong> a party to any transaction between Entrepreneurs and Customers. We do not inspect, verify, endorse, or guarantee the quality, safety, legality, or accuracy of any products or services listed on the Platform. All transactions are directly between the Entrepreneur and the Customer.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">6.5 Refunds</h3>
              <p className="text-muted-foreground mb-6">
                Refund policies for product purchases are determined by individual Entrepreneurs. For subscription fees, refunds are provided at our discretion and in accordance with our refund policy. Platform commission fees are non-refundable.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">7. Intellectual Property Rights</h2>
              <p className="text-muted-foreground mb-4">
                The SteerSolo platform, including all software, design, text, graphics, and other content created by us, is our exclusive property and is protected by Nigerian and international intellectual property laws.
              </p>
              <p className="text-muted-foreground mb-6">
                You retain ownership of content you upload to the Platform. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content as necessary to provide our services, including for marketing and promotional purposes on the Platform.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">8. AI-Generated Content Disclaimer</h2>
              <p className="text-muted-foreground mb-4">
                SteerSolo provides AI-powered features that can generate content such as product descriptions, shop descriptions, marketing tips, and business suggestions (e.g., "Stroke My Shop," "Know This Shop," AI product descriptions). By using these features, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>AI-generated content is provided as <strong>suggestions only</strong> and may contain inaccuracies, errors, or inappropriate content.</li>
                <li>You are solely responsible for <strong>reviewing, editing, and approving</strong> any AI-generated content before publishing it on your store or using it in any capacity.</li>
                <li>SteerSolo does not guarantee the accuracy, completeness, or suitability of AI-generated content for any particular purpose.</li>
                <li>You assume all liability for AI-generated content that you choose to publish or use.</li>
                <li>AI-generated content should not be relied upon as professional, legal, financial, or medical advice.</li>
              </ul>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">9. Prohibited Activities</h2>
              <p className="text-muted-foreground mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Use the Platform for any illegal purpose or in violation of any laws</li>
                <li>Post false, misleading, or fraudulent content</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
                <li>Use the Platform to distribute malware or other harmful code</li>
                <li>Engage in any activity that interferes with the proper functioning of the Platform</li>
                <li>Sell counterfeit, stolen, or illegal products</li>
                <li>Manipulate reviews, ratings, or other feedback systems</li>
                <li>Use AI features to generate misleading, deceptive, or harmful content</li>
                <li>Attempt to circumvent platform commission or fees through off-platform transactions initiated on the Platform</li>
              </ul>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">10. Dispute Resolution</h2>
              <h3 className="font-heading text-xl font-semibold mb-3">10.1 Seller-Buyer Disputes</h3>
              <p className="text-muted-foreground mb-4">
                Disputes between Entrepreneurs and Customers regarding products, orders, or services should <strong>first be resolved directly between the parties</strong>. We encourage open communication via the WhatsApp channels provided on the Platform.
              </p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">10.2 SteerSolo Mediation</h3>
              <p className="text-muted-foreground mb-4">
                If a resolution cannot be reached within 7 business days, either party may contact SteerSolo for mediation assistance by emailing <strong>steerifygroup@gmail.com</strong>. SteerSolo will review the dispute and provide a non-binding recommendation within 14 business days. SteerSolo's mediation is provided in good faith but we are not obligated to resolve any dispute between users.
              </p>

              <h3 className="font-heading text-xl font-semibold mb-3">10.3 Formal Arbitration</h3>
              <p className="text-muted-foreground mb-6">
                Any disputes arising from these Terms or your use of the Platform that cannot be resolved through mediation shall be resolved through binding arbitration in Lagos, Nigeria, in accordance with the Arbitration and Conciliation Act of Nigeria. Each party shall bear their own costs unless the arbitrator determines otherwise.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">11. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                SteerSolo provides a technology platform that connects Entrepreneurs with Customers. <strong>We are not responsible for:</strong>
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>The quality, safety, legality, or description accuracy of any products or services listed by Entrepreneurs</li>
                <li>The ability of Entrepreneurs to fulfill orders or provide services</li>
                <li>The ability of Customers to pay for purchases</li>
                <li>Any damages arising from transactions between Entrepreneurs and Customers</li>
                <li>Loss of business, revenue, or profits resulting from use of or inability to use the Platform</li>
                <li>Any content generated by AI tools that is published by users</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                To the maximum extent permitted by Nigerian law, SteerSolo shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability for any claims arising from these Terms or your use of the Platform shall not exceed the amount you have paid to us in the twelve (12) months preceding the claim.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">12. Done-For-You Setup Service</h2>
              <p className="text-muted-foreground mb-4">
                SteerSolo offers a "Done-For-You" store setup service for Entrepreneurs who prefer professional assistance in creating their online store. By purchasing this service, you agree that:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>The setup fee (currently ₦5,000) is <strong>non-refundable</strong> once your store has been created, regardless of whether you choose to use the store afterward.</li>
                <li>The service includes store creation, product listing, and basic configuration as described at the time of purchase.</li>
                <li>You are responsible for providing accurate business information and product details for the setup.</li>
                <li>SteerSolo may use AI tools to assist in generating store descriptions and content during setup. You are responsible for reviewing and approving all content before your store goes live.</li>
                <li>Refund requests for the setup service may only be considered if the store has not yet been created and no work has commenced.</li>
              </ul>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">13. Account Deletion and Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                You may request deletion of your account at any time through the Settings page on the Platform. Upon account deletion:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li>Your profile, store, products, and associated data will be permanently removed from the Platform.</li>
                <li>Your email address will be recorded in our deletion registry to <strong>prevent re-registration</strong> with the same email. This is a security measure to prevent abuse and circumvention of bans.</li>
                <li>Transaction records may be retained as required by Nigerian tax and financial regulations for a period of up to 6 years.</li>
                <li>Any outstanding payouts or commissions will be processed before account deletion is finalized.</li>
                <li>Account deletion is <strong>irreversible</strong>. Once deleted, your store, products, reviews, and all associated data cannot be recovered.</li>
              </ul>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">14. Termination</h2>
              <p className="text-muted-foreground mb-6">
                We reserve the right to suspend or terminate your account at any time for any reason, including violation of these Terms. Upon termination, your right to use the Platform will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, limitations of liability, and dispute resolution provisions.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">15. Governing Law</h2>
              <p className="text-muted-foreground mb-6">
                These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions. The courts of Lagos, Nigeria shall have exclusive jurisdiction over any disputes arising from these Terms.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">16. Changes to Terms</h2>
              <p className="text-muted-foreground mb-6">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our Platform and updating the "Last Updated" date. Your continued use of the Platform after such changes constitutes your acceptance of the modified Terms. For material changes affecting fees or commissions, we will provide at least 30 days' notice.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">17. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-foreground font-semibold">Steerify Group (SteerSolo)</p>
                <p className="text-muted-foreground">Lagos, Nigeria</p>
                <p className="text-muted-foreground">Email: steerifygroup@gmail.com</p>
                <p className="text-muted-foreground">WhatsApp: +234 905 994 7055</p>
              </div>

            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;
