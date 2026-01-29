import { useEffect } from "react";

export const SEOSchemas = () => {
  useEffect(() => {
    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SteerSolo",
      "alternateName": "Steerify Group",
      "url": "https://steersolo.lovable.app",
      "logo": "https://storage.googleapis.com/gpt-engineer-file-uploads/eBsWWGRw3yXgnjWFFzlewkCjL7c2/uploads/1762513867554-SteerSolo%20icon.jpg",
      "description": "Nigeria's #1 e-commerce platform for solo entrepreneurs. Create your professional online store, receive payments via Paystack, and grow your business.",
      "foundingDate": "2024",
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
      "areaServed": {
        "@type": "Country",
        "name": "Nigeria"
      }
    };

    // Product/Service Schema with NGN pricing
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "SteerSolo E-Commerce Platform",
      "description": "Professional online store builder for Nigerian entrepreneurs. Create your store, list products, receive payments via Paystack, and grow your business.",
      "brand": {
        "@type": "Brand",
        "name": "SteerSolo"
      },
      "offers": [
        {
          "@type": "Offer",
          "name": "Basic Plan",
          "description": "Perfect for new sellers starting their online journey",
          "price": "1000",
          "priceCurrency": "NGN",
          "priceValidUntil": "2026-12-31",
          "availability": "https://schema.org/InStock",
          "url": "https://steersolo.lovable.app/pricing",
          "seller": {
            "@type": "Organization",
            "name": "SteerSolo"
          }
        },
        {
          "@type": "Offer",
          "name": "Pro Plan",
          "description": "For growing businesses with advanced features",
          "price": "3000",
          "priceCurrency": "NGN",
          "priceValidUntil": "2026-12-31",
          "availability": "https://schema.org/InStock",
          "url": "https://steersolo.lovable.app/pricing"
        },
        {
          "@type": "Offer",
          "name": "Business Plan",
          "description": "Full suite with AI marketing tools and priority support",
          "price": "5000",
          "priceCurrency": "NGN",
          "priceValidUntil": "2026-12-31",
          "availability": "https://schema.org/InStock",
          "url": "https://steersolo.lovable.app/pricing"
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

    // FAQ Schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much does SteerSolo cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SteerSolo starts at ₦1,000/month for the Basic plan. We also offer Pro (₦3,000/month) and Business (₦5,000/month) plans with advanced features. All plans include a 7-day free trial."
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
          "name": "How do customers find my store?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You get a unique store link (e.g., steersolo.lovable.app/s/yourshop) that you can share on WhatsApp, Instagram, Facebook, and anywhere else. Customers can browse your products and order directly."
          }
        },
        {
          "@type": "Question",
          "name": "Is SteerSolo safe for online payments?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! SteerSolo uses Paystack, Nigeria's leading payment processor, for all online transactions. All data is encrypted with SSL, and we never store your card details."
          }
        },
        {
          "@type": "Question",
          "name": "Can I sell services instead of products?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! SteerSolo supports both products and services. You can create bookable services with custom durations and let customers schedule appointments directly."
          }
        }
      ]
    };

    // WebSite Schema with SearchAction
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SteerSolo",
      "alternateName": "SteerSolo Nigeria",
      "url": "https://steersolo.lovable.app",
      "description": "Nigeria's e-commerce platform for solo entrepreneurs",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://steersolo.lovable.app/shops?search={search_term}"
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
    const schemas = [organizationSchema, productSchema, faqSchema, websiteSchema, softwareSchema];
    
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
