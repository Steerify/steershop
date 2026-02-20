import SEOPageTemplate from "./SEOPageTemplate";

const SmallBusinessTools = () => (
  <SEOPageTemplate
    metaTitle="Free Tools for Small Business Owners in Nigeria | SteerSolo"
    metaDescription="Everything Nigerian SMEs need to sell online: store builder, payment processing, order management, marketing tools, and AI assistant. Start free."
    heroTitle="Free Tools for Small Business Owners in Nigeria"
    heroSubtitle="Stop paying for expensive websites, POS machines, and marketing agencies. SteerSolo gives you everything you need to run and grow your business online."
    heroCTA="Get Your Free Business Tools"
    sections={[
      {
        title: "All-in-One Business Tools for Nigerian SMEs",
        description: "Running a small business in Nigeria shouldn't require 10 different apps and expensive subscriptions. SteerSolo combines everything in one place.",
        points: [
          "Online store builder — no coding needed",
          "Payment processing via Paystack",
          "Order management and tracking",
          "Customer database and CRM",
          "Revenue analytics and reports",
          "AI-powered marketing poster creator",
          "Inventory and stock management",
          "Delivery fee calculator"
        ]
      },
      {
        title: "Replace Expensive Business Tools",
        description: "You're probably spending hundreds of thousands on tools that SteerSolo can replace for just ₦1,000/month.",
        points: [
          "Replace your website developer (₦100k+) — SteerSolo is free to start",
          "Replace POS machine rental (₦5k/month) — accept payments online",
          "Replace graphic designers (₦10k per poster) — AI creates posters for you",
          "Replace order notebooks — digital order management",
          "Replace spreadsheet tracking — automated revenue reports",
          "Replace multiple WhatsApp groups — one dashboard for everything"
        ]
      },
      {
        title: "Perfect for Every Nigerian Business Type",
        description: "Whether you're selling products, offering services, or running a side hustle — SteerSolo has the tools you need.",
        points: [
          "Fashion & clothing sellers",
          "Food and catering businesses",
          "Beauty and skincare brands",
          "Freelancers and service providers",
          "Students with side hustles",
          "Artisans and handmade product sellers",
          "Event planners and photographers",
          "Fitness coaches and tutors"
        ]
      }
    ]}
    testimonial={{
      quote: "I used to pay ₦15,000/month for a website, ₦5,000 for POS, and ₦10,000 for a designer. SteerSolo replaced all of them for ₦1,000/month. Best business decision ever.",
      name: "Kelechi N.",
      business: "Catering Business, Enugu"
    }}
    faqs={[
      { question: "What tools does SteerSolo offer for small businesses?", answer: "Online store builder, Paystack payments, order management, customer CRM, revenue analytics, AI marketing poster creator, delivery calculator, and more." },
      { question: "Is SteerSolo free for small businesses?", answer: "Yes! Start with a 15-day free trial. After that, plans start at just ₦1,000/month — cheaper than any other business tool." },
      { question: "Can I use SteerSolo for a service business?", answer: "Yes! SteerSolo supports both products and services. You can create bookable services with custom durations for appointments." },
      { question: "Do I need a computer to use SteerSolo?", answer: "No! SteerSolo is fully mobile-friendly. Run your entire business from your phone." },
      { question: "How is SteerSolo different from a regular website?", answer: "SteerSolo is specifically built for selling. It includes payment processing, order management, and marketing tools — things a regular website doesn't have." }
    ]}
  />
);

export default SmallBusinessTools;
