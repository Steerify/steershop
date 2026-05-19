import React from "react";
import PageThemeShell from "@/components/PageThemeShell";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Database, Server, Eye, Lock } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <PageThemeShell>
      <div className="bg-background min-h-screen pb-20">
        {/* Header */}
        <header className="border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                SteerSolo
              </h1>
            </div>
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Legal Hub
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last Updated: <span className="font-semibold text-foreground">May 19, 2026</span>
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
            
            <section className="bg-muted/30 border border-border p-8 rounded-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-3 mt-0 mb-4">
                <ShieldCheck className="text-primary w-6 h-6" /> 1. Overview & Scope
              </h2>
              <p className="leading-relaxed">
                SteerSolo ("we," "us," or "our") is deeply committed to protecting your privacy and ensuring strict compliance with global data protection frameworks, including the Nigeria Data Protection Regulation (NDPR) and other applicable data privacy laws. 
              </p>
              <p className="leading-relaxed">
                This Privacy Policy outlines our corporate data governance practices. It explains how we collect, use, disclose, and safeguard your information when you visit our website steersolo.com and use our Escrow and Marketplace services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-4 border-b border-border pb-2">
                <Database className="text-primary w-6 h-6" /> 2. Collection of Your Information
              </h2>
              <p className="leading-relaxed">
                We may collect information about you in a variety of ways to provide our trusted marketplace and escrow services:
              </p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register.</li>
                <li><strong>Financial Data:</strong> Financial information required to facilitate Escrow transactions, such as bank account details (for Merchants) and payment gateway tokens. We do not store raw credit card numbers on our servers; all payment processing is securely handled by PCI-DSS compliant third-party gateways (e.g., Paystack).</li>
                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Platform, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-4 border-b border-border pb-2">
                <Server className="text-primary w-6 h-6" /> 3. Use of Your Information
              </h2>
              <p className="leading-relaxed">
                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
              </p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Administer Escrow transactions and securely release funds.</li>
                <li>Create and manage your verified Merchant or Buyer account.</li>
                <li>Compile anonymous statistical data and analysis for use internally or with third parties to improve platform performance.</li>
                <li>Deliver targeted Steerify Ads, newsletters, and promotional information regarding SteerSolo.</li>
                <li>Monitor and analyze usage and trends to prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-4 border-b border-border pb-2">
                <Eye className="text-primary w-6 h-6" /> 4. Disclosure of Your Information
              </h2>
              <p className="leading-relaxed">
                We maintain a strict policy of non-disclosure regarding your personal data, except in the following highly specific circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing (Paystack), data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
                <li><strong>Between Buyers and Merchants:</strong> To facilitate a transaction, we share strictly necessary fulfillment data (such as shipping address and phone number) between the Buyer and the Merchant.</li>
              </ul>
            </section>

            <section className="bg-primary/5 border border-primary/20 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-3 mt-0 mb-4">
                <Lock className="text-primary w-6 h-6" /> 5. Data Security & Retention
              </h2>
              <p className="leading-relaxed">
                We use administrative, technical, and physical security measures (including end-to-end encryption and secure tokenization) to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
              </p>
              <p className="leading-relaxed mt-4">
                We will only retain your personal information for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">
                6. Your Data Protection Rights
              </h2>
              <p className="leading-relaxed">
                Depending on your location, you may have specific rights regarding your personal data under the NDPR or other applicable laws. These include the right to request access, correction, erasure, data portability, and the right to object to or restrict processing. 
              </p>
              <p className="leading-relaxed mt-4">
                To exercise any of these rights, please contact our Data Protection Officer (DPO) at legal@steersolo.com. We will respond to your request within the timeframe stipulated by applicable law.
              </p>
            </section>

          </div>
        </main>
      </div>
    </PageThemeShell>
  );
};

export default PrivacyPolicy;
