import SEOPageTemplate from "./SEOPageTemplate";

const SellOnInstagram = () => (
  <SEOPageTemplate
    metaTitle="Sell on Instagram Nigeria — Stop Losing Orders in DMs | SteerSolo"
    metaDescription="Turn your Instagram followers into paying customers. Create a professional store link for your Instagram bio. Accept payments via Paystack. Free trial."
    heroTitle="Sell on Instagram Nigeria — Stop Losing Orders in DMs"
    heroSubtitle="Your Instagram DMs are full of 'how much?' messages that never convert. Get a professional store link for your bio and start receiving real orders with payment."
    heroCTA="Create Your Instagram Store Free"
    sections={[
      {
        title: "The Instagram Selling Problem in Nigeria",
        description: "You post beautiful product photos, get hundreds of DMs asking 'how much?', but most never buy. The problem isn't your product — it's the process.",
        points: [
          "DMs get lost in hundreds of conversations",
          "Customers ghost after asking for price",
          "No way to accept payment directly from DMs",
          "You can't track which posts drive the most sales",
          "Manually sending account details for each order is exhausting",
          "Fake orders waste your time and money"
        ]
      },
      {
        title: "The Solution: A Store Link in Your Bio",
        description: "Put a SteerSolo store link in your Instagram bio. When followers ask 'how much?', send them your link. They browse, select, pay, and you get notified.",
        points: [
          "Professional product catalog with photos and prices",
          "Customers see everything without DMing you",
          "Paystack checkout — card, bank transfer, USSD",
          "Automatic order notifications via WhatsApp and email",
          "No more 'send your account number' messages",
          "Track which products sell the most"
        ]
      },
      {
        title: "Perfect for Instagram Businesses",
        description: "Whether you sell fashion, food, beauty products, or services — SteerSolo works for every type of Instagram business in Nigeria.",
        points: [
          "Fashion & clothing — ankara, thrift, ready-to-wear",
          "Beauty & skincare — creams, makeup, wigs, hair",
          "Food businesses — cakes, small chops, meal prep",
          "Accessories — jewelry, bags, shoes, watches",
          "Services — photography, makeup artistry, tutorials",
          "Digital products — ebooks, courses, templates"
        ]
      }
    ]}
    testimonial={{
      quote: "I was spending 3 hours daily replying DMs with prices. Now I just say 'check link in bio' and orders come in with payment. Game changer!",
      name: "Chidinma E.",
      business: "Beauty Brand, Abuja"
    }}
    faqs={[
      { question: "How do I sell on Instagram in Nigeria?", answer: "Create a SteerSolo store, add your products, and put your store link in your Instagram bio. When followers ask about prices, direct them to your link." },
      { question: "Can I accept payments from Instagram?", answer: "Yes! Your SteerSolo store has Paystack integration. Customers pay via card, bank transfer, or USSD when they order from your store link." },
      { question: "Is this better than using Linktree?", answer: "Yes! Linktree just lists links. SteerSolo gives you a full online store with product catalog, payment processing, and order management." },
      { question: "How do I get more sales on Instagram?", answer: "Post consistently, use relevant hashtags, share your store link in stories, and run ads pointing to your SteerSolo store for easy checkout." },
      { question: "Do I need a business account on Instagram?", answer: "A business account helps with analytics, but SteerSolo works with any Instagram account. Just add your store link to your bio." }
    ]}
  />
);

export default SellOnInstagram;
