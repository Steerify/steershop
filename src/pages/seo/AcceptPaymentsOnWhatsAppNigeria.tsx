import SEOPageTemplate from "./SEOPageTemplate";

const AcceptPaymentsOnWhatsAppNigeria = () => (
  <SEOPageTemplate
    metaTitle="How to Accept Payments on WhatsApp in Nigeria | SteerSolo + Paystack"
    metaDescription="Accept payments on WhatsApp in Nigeria with SteerSolo. Use a store link and Paystack checkout to collect card, transfer, and USSD payments securely."
    heroTitle="Accept Payments on WhatsApp in Nigeria"
    heroSubtitle="Stop relying on manual transfer confirmations. Let customers pay directly through your storefront with Paystack-enabled checkout."
    heroCTA="Enable Online Payments"
    sections={[
      {
        title: "The Better Way to Collect WhatsApp Payments",
        description: "Manual payment flows slow down conversions and increase mistakes. A structured checkout is faster and cleaner.",
        points: [
          "Share product/store link instead of account details repeatedly",
          "Collect payment through a secure online checkout",
          "Support card, transfer, and USSD",
          "Reduce fake alerts and reconciliation stress",
          "Attach orders to payment records automatically",
          "Improve buyer confidence at payment stage"
        ]
      },
      {
        title: "How SteerSolo + Paystack Works",
        description: "SteerSolo integrates checkout directly into your storefront so your payment flow is built into the buyer journey.",
        points: [
          "Customer opens your storefront link",
          "They select products/services and checkout",
          "Paystack handles secure payment collection",
          "You receive order details in dashboard",
          "Track status from pending to delivered",
          "Reuse the same link for WhatsApp and Instagram"
        ]
      },
      {
        title: "Best Practices for Higher Payment Conversion",
        description: "Beyond setup, small UX changes can significantly improve paid orders.",
        points: [
          "Use clear product photos and final pricing",
          "Show delivery timelines and areas upfront",
          "Offer simple refund/return clarification",
          "Use limited-time promo codes during campaigns",
          "Keep checkout steps short and mobile-first",
          "Respond quickly after successful payment"
        ]
      }
    ]}
    faqs={[
      { question: "Can I accept card and transfer payments from WhatsApp customers?", answer: "Yes. SteerSolo checkout supports Paystack options including card and transfer." },
      { question: "Do I need to build a custom website first?", answer: "No. You can use your SteerSolo storefront link immediately for WhatsApp payment collection." },
      { question: "Is this safer than manual transfer screenshot confirmation?", answer: "Yes. Structured checkout gives cleaner records and reduces manual verification errors." },
      { question: "Can I still accept cash on delivery?", answer: "Yes. You can configure payment methods based on your operations." },
      { question: "Will this also work for Instagram traffic?", answer: "Yes. The same storefront checkout link can be shared across WhatsApp, Instagram, and other channels." }
    ]}
  />
);

export default AcceptPaymentsOnWhatsAppNigeria;
