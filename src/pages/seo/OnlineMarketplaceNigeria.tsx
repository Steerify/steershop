import SEOPageTemplate from "./SEOPageTemplate";

const OnlineMarketplaceNigeria = () => (
  <SEOPageTemplate
    metaTitle="Online Marketplace Nigeria for Trusted Vendors | SteerSolo Marketplace"
    metaDescription="Discover trusted Nigerian vendors across beauty, fashion, food, gadgets, and services on SteerSolo Marketplace. Browse stores and shop with confidence."
    heroTitle="The SteerSolo Marketplace in Nigeria"
    heroSubtitle="Find verified and growing Nigerian sellers in one marketplace. Compare stores, discover products, and shop from trusted storefronts."
    heroCTA="Start Selling on Marketplace"
    sections={[
      {
        title: "Why Buyers Use SteerSolo Marketplace",
        description: "SteerSolo Marketplace helps buyers discover and compare independent stores more easily than social feed browsing.",
        points: [
          "Browse multiple Nigerian stores in one place",
          "Discover products across popular categories",
          "Shop directly from seller storefronts",
          "Get a cleaner path from discovery to checkout",
          "Find both products and bookable services",
          "Save time versus DM-first buying"
        ]
      },
      {
        title: "Why Sellers Join the Marketplace",
        description: "Marketplace visibility complements social selling and helps new buyers discover your store.",
        points: [
          "Appear where buyers are actively looking to buy",
          "Keep your own storefront identity and branding",
          "Receive orders and payments with less friction",
          "Get discoverability beyond your followers",
          "Use your marketplace presence as social proof",
          "Scale from repeat buyers and referrals"
        ]
      },
      {
        title: "Categories with Strong Buyer Intent",
        description: "SteerSolo marketplace traffic aligns with practical, repeat-buy categories in Nigerian commerce.",
        points: [
          "Beauty and personal care",
          "Fashion and accessories",
          "Food vendors and kitchen brands",
          "Gadgets and phone accessories",
          "Home and lifestyle products",
          "Professional and creative services"
        ]
      }
    ]}
    faqs={[
      { question: "What is SteerSolo Marketplace?", answer: "It is a marketplace experience where buyers can discover and shop from Nigerian seller storefronts on SteerSolo." },
      { question: "Can I list my business on SteerSolo Marketplace?", answer: "Yes. Create a SteerSolo store, add products/services, and your store can be discovered by marketplace users." },
      { question: "Is this only for Lagos businesses?", answer: "No. Sellers and buyers across Nigeria can use SteerSolo Marketplace." },
      { question: "Do sellers still own their store branding?", answer: "Yes. Sellers keep their own storefront identity while benefiting from marketplace discovery." },
      { question: "How do buyers access stores?", answer: "Buyers can browse and open each store's dedicated page to place orders and checkout." }
    ]}
  />
);

export default OnlineMarketplaceNigeria;
