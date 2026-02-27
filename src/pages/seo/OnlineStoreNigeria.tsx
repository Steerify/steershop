import SEOPageTemplate from "./SEOPageTemplate";

const OnlineStoreNigeria = () => (
  <SEOPageTemplate
    metaTitle="Create Your Online Store in Nigeria — Free for 15 Days | SteerSolo"
    metaDescription="Build your professional online store in Nigeria in 60 seconds. No coding needed. Accept Paystack payments. Share on WhatsApp & Instagram. Start free."
    heroTitle="Create Your Online Store in Nigeria — Free for 15 Days"
    heroSubtitle="You don't need a developer, a domain name, or technical skills. Build your professional online store in 60 seconds and start selling today."
    heroCTA="Create My Store Free"
    sections={[
      {
        title: "Why Nigerian Businesses Need an Online Store",
        description: "The Nigerian e-commerce market is growing rapidly. Customers are searching online for products and services. If you don't have an online presence, you're losing sales.",
        points: [
          "Over 100 million Nigerians are online",
          "Mobile commerce is growing 30% year over year",
          "Customers trust businesses with professional online stores",
          "Competitors are already selling online — don't get left behind",
          "An online store works 24/7, even when you're sleeping",
          "Reach customers beyond your physical location"
        ]
      },
      {
        title: "Build Your Store in 3 Simple Steps",
        description: "SteerSolo makes it incredibly easy to get your business online. No coding, no domain setup, no hosting hassle.",
        points: [
          "Step 1: Sign up with your email or Google account",
          "Step 2: Add your business name, logo, and products",
          "Step 3: Share your unique store link and start selling",
          "Get a professional URL like steersolo.com/shop/yourbrand",
          "Add products with photos, descriptions, and prices",
          "Accept payments automatically via Paystack"
        ]
      },
      {
        title: "Everything You Need to Run Your Business Online",
        description: "SteerSolo gives you all the tools a Nigerian entrepreneur needs — from product management to payment processing to marketing.",
        points: [
          "Product catalog with unlimited photos",
          "Paystack payments — card, bank transfer, USSD",
          "Order management dashboard",
          "Revenue analytics and sales reports",
          "AI-powered marketing poster creator",
          "Customer management and order history",
          "WhatsApp and email order notifications",
          "Delivery fee calculator by location"
        ]
      }
    ]}
    testimonial={{
      quote: "I was paying a developer ₦150,000 for a website that took 3 months. SteerSolo gave me a better store in 60 seconds for ₦1,000/month.",
      name: "Tunde A.",
      business: "Electronics Store, Lagos"
    }}
    faqs={[
      { question: "What is the best online store builder in Nigeria?", answer: "SteerSolo is the best online store builder for Nigerian entrepreneurs. It's designed for local businesses with Paystack payments, WhatsApp integration, and Naira pricing." },
      { question: "How much does it cost to create an online store in Nigeria?", answer: "With SteerSolo, you can create an online store for as low as ₦1,000/month. Start with a 15-day free trial. No credit card required." },
      { question: "Do I need a website to sell online in Nigeria?", answer: "No! SteerSolo gives you a professional store link that works like a website. No domain or hosting needed. Just share your link on WhatsApp and Instagram." },
      { question: "Can I accept online payments in Nigeria?", answer: "Yes! SteerSolo integrates with Paystack. Your customers can pay via debit card, bank transfer, or USSD." },
      { question: "Is SteerSolo free?", answer: "SteerSolo offers a 15-day free trial with full access to all features. After that, plans start at ₦1,000/month." }
    ]}
  />
);

export default OnlineStoreNigeria;
