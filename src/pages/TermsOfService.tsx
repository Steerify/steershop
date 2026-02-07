import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const TermsOfService = () => {
  const lastUpdated = "January 1, 2025";

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
              <p className="text-muted-foreground mb-6">
                Welcome to SteerSolo ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the SteerSolo platform, website, mobile applications, and all related services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
              </p>
              <p className="text-muted-foreground mb-6">
                SteerSolo is a Nigerian-based e-commerce platform designed to empower solo entrepreneurs by providing them with tools to create professional online stores, manage products, process orders, and connect with customers.
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
              <p className="text-muted-foreground mb-6">
                You agree to immediately notify us of any unauthorized use of your account or any other breach of security. We will not be liable for any loss or damage arising from your failure to protect your account credentials.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">4. Entrepreneur Responsibilities</h2>
              <h3 className="font-heading text-xl font-semibold mb-3">4.1 Store Operation</h3>
              <p className="text-muted-foreground mb-4">
                As an Entrepreneur, you are solely responsible for the operation of your store, including but not limited to product listings, pricing, inventory management, order fulfillment, customer service, and compliance with applicable laws.
              </p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">4.2 Product Listings</h3>
              <p className="text-muted-foreground mb-4">
                You must ensure that all product listings are accurate, complete, and not misleading. You may not list any products that are illegal, counterfeit, stolen, or prohibited by Nigerian law or our policies.
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
              <p className="text-muted-foreground mb-4">
                As a Customer, you agree to provide accurate information when placing orders, pay for products you order, and communicate respectfully with Entrepreneurs. You understand that transactions are between you and the Entrepreneur, and that SteerSolo facilitates but is not a party to these transactions.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">6. Payment Terms and Fees</h2>
              <h3 className="font-heading text-xl font-semibold mb-3">6.1 Subscription Fees</h3>
              <p className="text-muted-foreground mb-4">
                Entrepreneurs may be required to pay subscription fees to access certain features. Current pricing is displayed on our website. We reserve the right to modify pricing with reasonable notice.
              </p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">6.2 Payment Processing</h3>
              <p className="text-muted-foreground mb-4">
                Payments are processed through our third-party payment processor, Paystack. By using our payment services, you also agree to Paystack's terms of service. We do not store your complete payment information.
              </p>
              
              <h3 className="font-heading text-xl font-semibold mb-3">6.3 Refunds</h3>
              <p className="text-muted-foreground mb-6">
                Refund policies for product purchases are determined by individual Entrepreneurs. For subscription fees, refunds are provided at our discretion and in accordance with our refund policy.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">7. Intellectual Property Rights</h2>
              <p className="text-muted-foreground mb-4">
                The SteerSolo platform, including all software, design, text, graphics, and other content created by us, is our exclusive property and is protected by Nigerian and international intellectual property laws.
              </p>
              <p className="text-muted-foreground mb-6">
                You retain ownership of content you upload to the Platform. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content as necessary to provide our services.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">8. Prohibited Activities</h2>
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
              </ul>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">9. Dispute Resolution</h2>
              <p className="text-muted-foreground mb-4">
                Disputes between Entrepreneurs and Customers should first be resolved directly between the parties. If a resolution cannot be reached, either party may contact SteerSolo for assistance.
              </p>
              <p className="text-muted-foreground mb-6">
                Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration in Lagos, Nigeria, in accordance with the Arbitration and Conciliation Act of Nigeria.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">10. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-6">
                To the maximum extent permitted by Nigerian law, SteerSolo shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of the Platform. Our total liability for any claims arising from these Terms or your use of the Platform shall not exceed the amount you have paid to us in the twelve (12) months preceding the claim.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">11. Termination</h2>
              <p className="text-muted-foreground mb-6">
                We reserve the right to suspend or terminate your account at any time for any reason, including violation of these Terms. Upon termination, your right to use the Platform will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">12. Governing Law</h2>
              <p className="text-muted-foreground mb-6">
                These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions. The courts of Lagos, Nigeria shall have exclusive jurisdiction over any disputes arising from these Terms.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">13. Changes to Terms</h2>
              <p className="text-muted-foreground mb-6">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our Platform and updating the "Last Updated" date. Your continued use of the Platform after such changes constitutes your acceptance of the modified Terms.
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-2xl font-bold text-primary mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-foreground font-semibold">SteerSolo Limited</p>
                <p className="text-muted-foreground">Lagos, Nigeria</p>
                <p className="text-muted-foreground">Email: legal@steersolo.com</p>
                <p className="text-muted-foreground">Phone: +234 XXX XXX XXXX</p>
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
