import SEOPageTemplate from "./SEOPageTemplate";

const SellOnWhatsApp = () => (
  <SEOPageTemplate
    metaTitle="How to Sell on WhatsApp in Nigeria — Create Your WhatsApp Store | SteerSolo"
    metaDescription="Create a professional WhatsApp store in 60 seconds. Accept payments via Paystack, manage orders, and grow your WhatsApp business. Free 15-day trial."
    heroTitle="Sell on WhatsApp in Nigeria — Create Your WhatsApp Store Today"
    heroSubtitle="Stop losing orders in WhatsApp DMs. Get a professional store link, accept payments online, and manage all your WhatsApp sales in one place."
    heroCTA="Create Your WhatsApp Store Free"
    sections={[
      {
        title: "Why You Need a WhatsApp Store in Nigeria",
        description: "Over 90 million Nigerians use WhatsApp daily. If you're selling on WhatsApp, you need more than just DMs to manage your business.",
        points: [
          "Share one professional link on your WhatsApp status",
          "Customers browse products and order without calling you",
          "Accept card payments, bank transfers, and USSD via Paystack",
          "Get instant notifications when orders come in",
          "No more lost orders in group chats and DMs",
          "Track revenue and manage inventory from your phone"
        ]
      },
      {
        title: "How to Set Up Your WhatsApp Store",
        description: "Creating your WhatsApp store with SteerSolo takes just 60 seconds. Here's how it works:",
        points: [
          "Step 1: Sign up free — no credit card required",
          "Step 2: Enter your business name and WhatsApp number",
          "Step 3: Add your products with photos and prices",
          "Step 4: Share your unique store link on WhatsApp status",
          "Step 5: Receive orders and payments automatically"
        ]
      },
      {
        title: "Features Built for WhatsApp Sellers",
        description: "SteerSolo was designed specifically for Nigerian entrepreneurs who sell on WhatsApp and social media.",
        points: [
          "WhatsApp order notifications — never miss a sale",
          "Paystack checkout — accept card and bank transfer payments",
          "Product catalog with photos, prices, and descriptions",
          "Order tracking from pending to delivered",
          "Customer database — know your repeat buyers",
          "AI-powered marketing posters to share on WhatsApp status",
          "Delivery fee calculator for different locations",
          "Coupon codes to boost sales"
        ]
      }
    ]}
    testimonial={{
      quote: "Before SteerSolo, I was losing orders in my WhatsApp DMs. Now I share one link and customers order by themselves. My sales increased by 40% in the first month!",
      name: "Amina O.",
      business: "Fashion Vendor, Lagos"
    }}
    faqs={[
      { question: "How do I create a WhatsApp store in Nigeria?", answer: "Sign up on SteerSolo for free, add your products, and share your unique store link on WhatsApp. Customers can browse and order directly. No coding needed." },
      { question: "Can customers pay through my WhatsApp store?", answer: "Yes! SteerSolo integrates with Paystack. Customers can pay via card, bank transfer, or USSD directly from your store link." },
      { question: "Is the WhatsApp store link different from WhatsApp Business?", answer: "Yes. WhatsApp Business only lets you create a basic catalog. SteerSolo gives you a full online store with payment processing, order management, and analytics." },
      { question: "How much does a WhatsApp store cost?", answer: "SteerSolo starts at ₦1,000/month with a 15-day free trial. No credit card required to start." },
      { question: "Can I use SteerSolo on my phone?", answer: "Absolutely! SteerSolo is fully mobile-friendly. Manage your entire store from your phone." }
    ]}
  />
);

export default SellOnWhatsApp;
