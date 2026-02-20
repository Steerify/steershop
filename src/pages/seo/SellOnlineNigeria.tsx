import SEOPageTemplate from "./SEOPageTemplate";

const SellOnlineNigeria = () => (
  <SEOPageTemplate
    metaTitle="How to Start Selling Online in Nigeria — Step-by-Step Guide | SteerSolo"
    metaDescription="Complete beginner's guide to selling online in Nigeria. Learn how to create a store, add products, accept payments, and get your first sale. Start free."
    heroTitle="How to Start Selling Online in Nigeria — Step-by-Step Guide"
    heroSubtitle="Whether you're a student, stay-at-home mom, or experienced vendor — this guide shows you exactly how to start selling online in Nigeria today."
    heroCTA="Start Selling Online Free"
    sections={[
      {
        title: "Step 1: Choose What to Sell Online",
        description: "The best products to sell online in Nigeria are things people already buy on WhatsApp and Instagram. You don't need to invent something new.",
        points: [
          "Fashion — clothes, shoes, bags, accessories, ankara",
          "Food — cakes, small chops, meal prep, snacks, drinks",
          "Beauty — skincare, makeup, wigs, hair products",
          "Electronics — phone accessories, gadgets, earphones",
          "Services — photography, tutoring, cleaning, beauty services",
          "Digital products — ebooks, courses, templates"
        ]
      },
      {
        title: "Step 2: Create Your Online Store",
        description: "You don't need a developer or technical skills. With SteerSolo, you can create a professional online store in 60 seconds.",
        points: [
          "Sign up free at steersolo.lovable.app",
          "Enter your business name and WhatsApp number",
          "Upload your logo or let AI create one for you",
          "Add your products with photos and prices",
          "Your store is live immediately — share the link anywhere",
          "15-day free trial, no credit card needed"
        ]
      },
      {
        title: "Step 3: Get Your First Sale",
        description: "The key to getting your first sale is sharing your store link with the right people. Here's a proven strategy that works for Nigerian sellers.",
        points: [
          "Share your store link on WhatsApp status (morning, afternoon, evening)",
          "Add your store link to your Instagram bio",
          "Post product photos on social media with your store link",
          "Join relevant WhatsApp groups and share your link (respectfully)",
          "Ask friends and family to share your store link",
          "Use SteerSolo's AI poster creator for professional marketing images"
        ]
      },
      {
        title: "Step 4: Scale and Grow Your Business",
        description: "Once you start getting sales, here's how to grow your online business in Nigeria.",
        points: [
          "Track your best-selling products and stock up",
          "Use SteerSolo's Ads Assistant to create Google and Facebook ads",
          "Offer discounts and coupon codes to repeat customers",
          "Add more products based on customer demand",
          "Get verified on SteerSolo for increased trust",
          "Upgrade to Pro or Business plan for advanced marketing tools"
        ]
      }
    ]}
    testimonial={{
      quote: "I'm a university student and I started selling shoes online with SteerSolo. I made ₦150,000 in my first month just from sharing my store link on WhatsApp!",
      name: "David O.",
      business: "Sneaker Vendor, Ibadan"
    }}
    faqs={[
      { question: "How do I start selling online in Nigeria as a beginner?", answer: "Create a free SteerSolo store, add your products with photos and prices, and share your store link on WhatsApp and Instagram. You can get your first sale within 48 hours." },
      { question: "How much money do I need to start selling online?", answer: "You can start for free! SteerSolo offers a 15-day free trial. After that, plans start at ₦1,000/month. You just need products to sell and a phone." },
      { question: "What's the best platform to sell online in Nigeria?", answer: "SteerSolo is the best platform for Nigerian sellers because it's built specifically for local businesses with Paystack payments, WhatsApp integration, and Naira pricing." },
      { question: "Can I sell online from my phone?", answer: "Yes! SteerSolo is fully mobile-friendly. Create your store, add products, manage orders, and track revenue — all from your phone." },
      { question: "How do I receive payments when selling online?", answer: "SteerSolo integrates with Paystack. Customers pay via card, bank transfer, or USSD. Money is settled to your bank account within 24 hours." }
    ]}
  />
);

export default SellOnlineNigeria;
