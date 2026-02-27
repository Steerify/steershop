import { useEffect } from "react";

export const SEOSchemas = () => {
  useEffect(() => {
    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SteerSolo",
      "alternateName": ["Steerify Group", "SteerSolo Nigeria", "Steer Solo", "SteerSolo Online Store Builder", "Nigerian Online Store Creator", "SteerSolo Ecommerce", "SteerSolo WhatsApp Store"],
      "url": "https://steersolo.com",
      "logo": "https://storage.googleapis.com/gpt-engineer-file-uploads/eBsWWGRw3yXgnjWFFzlewkCjL7c2/uploads/1762513867554-SteerSolo%20icon.jpg",
      "description": "Nigeria's #1 e-commerce platform for solo entrepreneurs. Create your professional online store, receive payments via Paystack, and grow your business.",
      "foundingDate": "2024",
      "knowsAbout": [
        "e-commerce", "online selling", "WhatsApp business", "Nigerian small business", "social commerce",
        "Paystack payments", "Instagram selling", "online store builder", "digital marketing Nigeria",
        "small business tools", "mobile commerce", "African ecommerce", "online payments Nigeria",
        "WhatsApp store builder", "order management", "inventory management", "product catalog",
        "online checkout", "payment gateway integration", "customer management", "sales analytics",
        "business growth", "digital storefront", "social media selling", "online marketplace",
        "Nigerian entrepreneurs", "solo entrepreneur tools", "business automation", "delivery logistics",
        "revenue tracking", "subscription commerce", "booking system", "service marketplace"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "NG",
        "addressLocality": "Lagos",
        "addressRegion": "Lagos State"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+2349059947055",
        "email": "steerifygroup@gmail.com",
        "contactType": "customer service",
        "availableLanguage": ["English", "Pidgin"]
      },
      "sameAs": [
        "https://instagram.com/steerifygroup",
        "https://x.com/SteerifyGroup",
        "https://www.threads.net/@steerifygroup"
      ],
      "areaServed": [
        { "@type": "Country", "name": "Nigeria" },
        { "@type": "Country", "name": "Ghana" },
        { "@type": "Country", "name": "Kenya" },
        { "@type": "Country", "name": "South Africa" },
        { "@type": "Continent", "name": "Africa" }
      ]
    };

    // Product/Service Schema with NGN pricing
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "SteerSolo E-Commerce Platform",
      "description": "Professional online store builder for Nigerian entrepreneurs. Create your store, list products, receive payments via Paystack, and grow your business.",
      "brand": { "@type": "Brand", "name": "SteerSolo" },
      "offers": [
        {
          "@type": "Offer",
          "name": "Basic Plan",
          "description": "Perfect for new sellers starting their online journey",
          "price": "1000",
          "priceCurrency": "NGN",
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/InStock",
          "url": "https://steersolo.com/pricing",
          "seller": { "@type": "Organization", "name": "SteerSolo" }
        },
        {
          "@type": "Offer",
          "name": "Pro Plan",
          "description": "For growing businesses with advanced features and DFY business profile",
          "price": "3000",
          "priceCurrency": "NGN",
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/InStock",
          "url": "https://steersolo.com/pricing"
        },
        {
          "@type": "Offer",
          "name": "Business Plan",
          "description": "Full suite with AI marketing tools, SEO, Google My Business setup, and priority support",
          "price": "5000",
          "priceCurrency": "NGN",
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/InStock",
          "url": "https://steersolo.com/pricing"
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "500",
        "bestRating": "5",
        "worstRating": "1"
      }
    };

    // FAQ Schema - expanded with high-traffic terms
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I start selling online in Nigeria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "With SteerSolo, you can start selling online in Nigeria in 60 seconds. Sign up, enter your business name, add your products with photos and prices, and share your unique store link on WhatsApp or Instagram. No coding or website building skills needed. Accept payments via Paystack (card, bank transfer, USSD)."
          }
        },
        {
          "@type": "Question",
          "name": "What's the best online store builder for small businesses in Nigeria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SteerSolo is built specifically for Nigerian small businesses and solo entrepreneurs. Unlike generic platforms, SteerSolo integrates WhatsApp ordering, Paystack payments, and AI-powered marketing tools. Plans start at just ₦1,000/month with a 15-day free trial."
          }
        },
        {
          "@type": "Question",
          "name": "How do I create a WhatsApp store?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SteerSolo lets you create a professional online store with WhatsApp integration. Your customers can browse your products on your store link and place orders that come directly to your WhatsApp. You can also accept payments online via Paystack before delivery."
          }
        },
        {
          "@type": "Question",
          "name": "How much does SteerSolo cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SteerSolo starts at ₦1,000/month for the Basic plan. We also offer Pro (₦3,000/month) and Business (₦5,000/month) plans with advanced features. All plans include a 15-day free trial. No credit card required."
          }
        },
        {
          "@type": "Question",
          "name": "Can I receive payments through SteerSolo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! SteerSolo integrates with Paystack for secure online payments. Customers can pay via card, bank transfer, or USSD. You can also accept manual payments and cash on delivery."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need technical skills to use SteerSolo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No technical skills required! SteerSolo is designed for Nigerian entrepreneurs. You can create your professional online store in 60 seconds, add products with photos, and start receiving orders via WhatsApp."
          }
        },
        {
          "@type": "Question",
          "name": "How do I sell on Instagram and receive payments in Nigeria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Instead of managing orders in Instagram DMs, create a SteerSolo store and share your store link in your Instagram bio. Customers can browse, select products, and pay directly via Paystack. Orders are organized automatically — no more lost DMs."
          }
        },
        {
          "@type": "Question",
          "name": "How do customers find my store?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You get a unique store link (e.g., steersolo.com/shop/yourshop) that you can share on WhatsApp, Instagram, Facebook, and anywhere else. Your store is also indexed by Google and AI search engines for organic discovery."
          }
        },
        {
          "@type": "Question",
          "name": "Can I sell services instead of products?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! SteerSolo supports both products and services. You can create bookable services with custom durations and let customers schedule appointments directly."
          }
        },
        {
          "@type": "Question",
          "name": "Is SteerSolo better than Jumia or Konga for small sellers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SteerSolo is different from Jumia and Konga. Those are marketplaces where your products compete with thousands of others. SteerSolo gives you your OWN online store with your OWN link. You control your branding, pricing, and customer relationships. No marketplace commission fees."
          }
        },
        {
          "@type": "Question",
          "name": "How do I sell food online in Nigeria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Create a SteerSolo store, add your food items with photos and prices, and share your link on WhatsApp and Instagram. Customers can order and pay online. Perfect for cake businesses, small chops vendors, meal prep services, and restaurant owners in Lagos, Abuja, and across Nigeria."
          }
        },
        {
          "@type": "Question",
          "name": "Can I sell fashion and clothing online with SteerSolo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! SteerSolo is perfect for fashion businesses — ankara, ready-to-wear, thrift stores, custom clothing, shoes, bags, and accessories. Add product photos, set sizes, and accept payments via Paystack. Share your store link on Instagram and WhatsApp to start getting orders."
          }
        },
        {
          "@type": "Question",
          "name": "How do I track orders and manage my online business?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SteerSolo has a built-in dashboard where you can track all orders, manage products, view revenue analytics, and communicate with customers. You get real-time notifications for new orders and can update order status from pending to delivered."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use SteerSolo on my phone?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! SteerSolo is fully mobile-friendly. You can manage your store, add products, process orders, and track revenue entirely from your phone. No laptop or computer required."
          }
        },
        {
          "@type": "Question",
          "name": "Does SteerSolo work outside Lagos?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! SteerSolo works everywhere in Nigeria — Lagos, Abuja, Port Harcourt, Ibadan, Kano, Enugu, Benin City, Warri, Owerri, and all 36 states. We also support sellers in Ghana, Kenya, and across Africa."
          }
        },
        {
          "@type": "Question",
          "name": "How do I get my first sale online in Nigeria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "After creating your SteerSolo store, share your unique store link on your WhatsApp status, WhatsApp groups, Instagram bio, and Facebook page. Most sellers get their first sale within 48 hours of sharing their link."
          }
        },
        {
          "@type": "Question",
          "name": "Can I deliver products to customers across Nigeria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! SteerSolo integrates with delivery services for shipping across Nigeria. You can set delivery fees by location, offer free delivery, or let customers choose pickup. We support same-day delivery in Lagos and interstate shipping."
          }
        },
        {
          "@type": "Question",
          "name": "Is there a free trial for SteerSolo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Every new account gets a 15-day free trial with full access to all features. No credit card required. You can create your store, add products, and start selling immediately."
          }
        }
      ]
    };

    // BreadcrumbList Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://steersolo.com" },
        { "@type": "ListItem", "position": 2, "name": "Explore Shops", "item": "https://steersolo.com/shops" },
        { "@type": "ListItem", "position": 3, "name": "Pricing", "item": "https://steersolo.com/pricing" },
        { "@type": "ListItem", "position": 4, "name": "How It Works", "item": "https://steersolo.com/how-it-works" },
        { "@type": "ListItem", "position": 5, "name": "FAQ", "item": "https://steersolo.com/faq" },
        { "@type": "ListItem", "position": 6, "name": "Sell on WhatsApp", "item": "https://steersolo.com/sell-on-whatsapp" },
        { "@type": "ListItem", "position": 7, "name": "Sell on Instagram", "item": "https://steersolo.com/sell-on-instagram" },
        { "@type": "ListItem", "position": 8, "name": "Create Online Store", "item": "https://steersolo.com/online-store-nigeria" }
      ]
    };

    // WebSite Schema with SearchAction
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SteerSolo",
      "alternateName": ["SteerSolo Nigeria", "Steer Solo", "SteerSolo Online Store Builder"],
      "url": "https://steersolo.com",
      "description": "Nigeria's e-commerce platform for solo entrepreneurs. Create your online store, accept WhatsApp orders, and receive Paystack payments.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://steersolo.com/shops?search={search_term}"
        },
        "query-input": "required name=search_term"
      },
      "inLanguage": "en-NG"
    };

    // SoftwareApplication Schema
    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "SteerSolo",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "1000",
        "priceCurrency": "NGN"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "500"
      }
    };

    // Create and inject script
    const schemas = [organizationSchema, productSchema, faqSchema, breadcrumbSchema, websiteSchema, softwareSchema];
    
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "steersolo-schemas";
    script.text = JSON.stringify(schemas);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById("steersolo-schemas");
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return null;
};
