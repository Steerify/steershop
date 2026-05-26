import React from "react";
import { PageThemeShell } from "@/components/PageThemeShell";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Scale, FileText, Lock, AlertTriangle } from "lucide-react";

const TermsOfService = () => {
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
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">
              Last Updated: <span className="font-semibold text-foreground">May 19, 2026</span>
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
            
            <section className="bg-muted/30 border border-border p-8 rounded-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-3 mt-0 mb-4">
                <FileText className="text-primary w-6 h-6" /> 1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("User", "You", "Merchant", or "Buyer"), and SteerSolo ("Company", "we", "us", or "our"), concerning your access to and use of the steersolo.com website as well as any other media form, channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Platform").
              </p>
              <p className="leading-relaxed">
                By accessing or using the Platform, you expressly acknowledge that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms, then you are expressly prohibited from using the Platform and you must discontinue use immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-4 border-b border-border pb-2">
                <Scale className="text-primary w-6 h-6" /> 2. Marketplace Role & Escrow Mechanism
              </h2>
              <p className="leading-relaxed">
                SteerSolo provides a digital marketplace that connects verified Nigerian merchants ("Merchants") with consumers ("Buyers"). We act as a facilitator and, where applicable, a secure Escrow agent to protect transactional integrity.
              </p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li><strong>No Ownership of Goods:</strong> SteerSolo does not manufacture, store, or inspect any of the items sold through our Platform. We make no warranties regarding the quality, safety, or legality of items advertised.</li>
                <li><strong>Escrow Services:</strong> For transactions utilizing the "SteerSolo Safe" payment gateway, funds are held in a secure Escrow account. Funds are only disbursed to the Merchant upon verifiable delivery and acceptance by the Buyer, or after the expiration of the standard dispute window (48 hours post-delivery).</li>
                <li><strong>Dispute Resolution:</strong> If a Buyer raises a valid dispute within 48 hours of delivery (e.g., item not as described, damaged), SteerSolo reserves the unilateral right to freeze the Escrow funds pending an internal investigation. Our decision regarding the release or refund of Escrow funds shall be final and binding.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-4 border-b border-border pb-2">
                <ShieldCheck className="text-primary w-6 h-6" /> 3. Merchant Obligations & Verification
              </h2>
              <p className="leading-relaxed">
                To maintain the integrity of the "SteerSolo Safe" ecosystem, all Merchants are subject to stringent verification protocols.
              </p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li><strong>Accuracy of Information:</strong> Merchants must provide highly accurate, current, and complete information during the registration process, including valid identification and business registration documents if applicable.</li>
                <li><strong>Prohibited Items:</strong> Merchants are strictly prohibited from listing counterfeit goods, illicit substances, digital currency, highly regulated items, or any products that violate Nigerian law or international trade embargoes.</li>
                <li><strong>Account Termination:</strong> We reserve the right, at our sole discretion, to suspend or terminate any Merchant account that demonstrates fraudulent behavior, high dispute rates, or failure to fulfill orders. In such events, pending Escrow funds may be returned to the respective Buyers.</li>
              </ul>
            </section>

            <section className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-3 mt-0 mb-4 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" /> 4. Limitation of Liability
              </h2>
              <p className="leading-relaxed text-red-900 dark:text-red-200">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL STEERSOLO, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
              </p>
              <p className="leading-relaxed text-red-900 dark:text-red-200 mt-4">
                OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US FOR PLATFORM FEES DURING THE SIX (6) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-4 border-b border-border pb-2">
                <Lock className="text-primary w-6 h-6" /> 5. Intellectual Property Rights
              </h2>
              <p className="leading-relaxed">
                Unless otherwise indicated, the Platform is our proprietary property. All source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Platform (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">
                6. Governing Law & Arbitration
              </h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and defined following the laws of the Federal Republic of Nigeria. SteerSolo and yourself irrevocably consent that the courts of Nigeria shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
              </p>
              <p className="leading-relaxed mt-4">
                Any dispute arising out of or in connection with this contract, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by arbitration in accordance with the Arbitration and Mediation Act of Nigeria currently in force, which rules are deemed to be incorporated by reference into this clause.
              </p>
            </section>

          </div>
        </main>
      </div>
    </PageThemeShell>
  );
};

export default TermsOfService;
