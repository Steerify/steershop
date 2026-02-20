import SEOPageTemplate from "./SEOPageTemplate";

const AcceptPayments = () => (
  <SEOPageTemplate
    metaTitle="Accept Payments Online in Nigeria — Paystack Integration | SteerSolo"
    metaDescription="Accept card payments, bank transfers, and USSD online in Nigeria. Paystack-powered checkout for your online store. No technical setup required."
    heroTitle="Accept Payments Online in Nigeria — Simple Paystack Integration"
    heroSubtitle="Stop sending account numbers manually. Get a professional checkout page where customers pay via card, bank transfer, or USSD. Money goes straight to your bank."
    heroCTA="Start Accepting Payments Free"
    sections={[
      {
        title: "The Payment Problem for Nigerian Online Sellers",
        description: "Every Nigerian online seller knows the pain: customers ask for your account number, promise to pay, then disappear. It's time for a better way.",
        points: [
          "Manual bank transfers are unreliable — customers ghost",
          "You can't confirm payments until you check your bank app",
          "Sharing account numbers publicly is a security risk",
          "No receipt or order confirmation for customers",
          "Cash on delivery leads to fake orders and wasted trips",
          "You're missing customers who prefer card payments"
        ]
      },
      {
        title: "How Paystack Payments Work with SteerSolo",
        description: "SteerSolo integrates directly with Paystack to give you a professional checkout experience. No API setup or coding required.",
        points: [
          "Customer selects products and clicks 'Pay Now'",
          "Secure Paystack checkout page opens automatically",
          "Customer pays via card, bank transfer, or USSD",
          "Payment is confirmed instantly — no manual checking",
          "You get a WhatsApp notification with order details",
          "Money is settled to your bank account automatically"
        ]
      },
      {
        title: "Payment Methods Your Customers Can Use",
        description: "Paystack supports all the payment methods Nigerians prefer. Don't lose a sale because you can't accept how they want to pay.",
        points: [
          "Debit and credit cards (Mastercard, Visa, Verve)",
          "Bank transfer — instant confirmation",
          "USSD — no internet needed for customer",
          "Pay with bank (GTBank, First Bank, Access, etc.)",
          "QR code payments",
          "Split payments for marketplace models"
        ]
      }
    ]}
    testimonial={{
      quote: "Before SteerSolo, 60% of my customers would promise to transfer but never do. Now they pay before I even pack the order. My conversion rate tripled!",
      name: "Blessing I.",
      business: "Skincare Brand, Port Harcourt"
    }}
    faqs={[
      { question: "How do I accept online payments in Nigeria?", answer: "Create a SteerSolo store and connect Paystack. Customers can pay via card, bank transfer, or USSD when they order from your store." },
      { question: "Do I need a Paystack account?", answer: "SteerSolo handles the Paystack setup for you. You just enter your bank details and start receiving payments." },
      { question: "How fast do I receive my money?", answer: "Paystack settles payments to your bank account within 24 hours (next business day)." },
      { question: "Is it safe to accept payments online?", answer: "Yes! Paystack is PCI-DSS compliant and used by over 600,000 businesses in Nigeria. Your customers' payment data is encrypted and secure." },
      { question: "What are the transaction fees?", answer: "Paystack charges 1.5% + ₦100 per transaction (capped at ₦2,000). SteerSolo passes this to the customer so you receive the full product price." }
    ]}
  />
);

export default AcceptPayments;
