import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Rocket, 
  Store, 
  ShoppingBag, 
  CreditCard, 
  Shield, 
  HelpCircle,
  MessageCircle,
  ArrowRight,
  ChevronDown,
  Target
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  faqs: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: Rocket,
    faqs: [
      {
        question: "What is SteerSolo?",
        answer: "SteerSolo is a Nigerian e-commerce platform designed specifically for solo entrepreneurs and small business owners. It helps you build a professional online storefront, manage orders efficiently, accept payments securely, and grow your business with confidence—all without needing technical skills."
      },
      {
        question: "How do I create an account?",
        answer: "Creating an account is simple! Click 'Get Started' or 'Sign Up', enter your email address, and verify it using the OTP (One-Time Password) sent to you. You can also sign up instantly using your Google account. The entire process takes less than 60 seconds."
      },
      {
        question: "Is SteerSolo free to use?",
        answer: "SteerSolo offers a 15-day free trial that gives you full access to all features. After your trial ends, you'll need an active subscription (starting at ₦1,000/month) to keep your store visible and operational. Your store data is preserved even if your subscription lapses."
      },
      {
        question: "What do I need to start selling?",
        answer: "All you need is: (1) An email address for your account, (2) A WhatsApp number for customer communication, and (3) Your products or services to list. Bank details can be added later when you're ready to accept online payments."
      }
    ]
  },
  {
    id: "shop-owners",
    name: "For Shop Owners",
    icon: Store,
    faqs: [
      {
        question: "How do I set up my store?",
        answer: "After signing up, you'll go through a quick onboarding process: add your business name, upload your logo and banner, write a brief description, and add at least one product or service. You can customize everything later from your dashboard."
      },
      {
        question: "Can I customize my storefront?",
        answer: "Yes! You can personalize your storefront with: a business logo, a banner image, a detailed business description, and organized product categories. Your store gets a unique URL (steersolo.lovable.app/shop/your-shop-name) that you can share anywhere."
      },
      {
        question: "How do I add products and services?",
        answer: "Navigate to 'Products' in your dashboard, click 'Add Product', fill in the details (name, description, price, stock), upload high-quality photos, and save. You can also add services with optional booking functionality for appointments."
      },
      {
        question: "What payment methods can I accept?",
        answer: "SteerSolo supports: (1) Paystack—for secure card and bank transfer payments, (2) Direct Bank Transfer—customers pay to your bank account, and (3) Both methods simultaneously. You can also offer 'Pay After Service' for trusted customers (cash on delivery)."
      },
      {
        question: "How do I process orders?",
        answer: "Orders appear in your 'Orders' tab with full customer details. Update each order's status as you process it: Awaiting Approval → Confirmed → Processing → Out for Delivery → Delivered → Completed. Customers are notified of status changes."
      },
      {
        question: "What is the subscription fee?",
        answer: "SteerSolo costs ₦1,000/month for full access to all features including: unlimited products, order management, payment processing, marketing tools, and customer communication features. This is less than the cost of one meal out!"
      },
      {
        question: "How do I share my store?",
        answer: "From your 'My Store' page, you can: copy your store link, share directly to WhatsApp/Twitter/Facebook, download a QR code for physical marketing, and even print a professional flyer with your store details and QR code."
      }
    ]
  },
  {
    id: "customers",
    name: "For Customers",
    icon: ShoppingBag,
    faqs: [
      {
        question: "How do I find shops to buy from?",
        answer: "Browse the 'Shops' page to discover businesses, use the search function to find specific products across all shops, or filter by verified businesses. You can also access a shop directly if someone shares their store link with you."
      },
      {
        question: "Is my payment secure?",
        answer: "Absolutely! We use Paystack, Nigeria's leading and most trusted payment processor, which provides bank-level security and encryption for all transactions. Your card details are never stored on our servers."
      },
      {
        question: "How do I contact a seller?",
        answer: "Every shop has a WhatsApp button that connects you directly with the business owner. You can ask questions about products, negotiate custom orders, or discuss delivery arrangements—just like you would in person, but more convenient."
      },
      {
        question: "Can I track my order?",
        answer: "Yes! After placing an order, you can track its status from your 'Orders' page (if logged in) or through WhatsApp communication with the seller. Order statuses include: Confirmed, Processing, Out for Delivery, and Delivered."
      },
      {
        question: "What if I have an issue with my order?",
        answer: "Contact the seller directly via WhatsApp first—most issues are resolved quickly through direct communication. If you're unable to resolve the issue, you can submit feedback through our platform and we'll help mediate."
      }
    ]
  },
  {
    id: "payments",
    name: "Payments & Billing",
    icon: CreditCard,
    faqs: [
      {
        question: "What happens after my free trial ends?",
        answer: "When your 14-day trial expires, your store becomes hidden from public view (customers can't see it). However, all your data—products, orders, settings—is preserved. Simply subscribe to reactivate your store instantly."
      },
      {
        question: "How do payments to sellers work?",
        answer: "When customers pay via Paystack, the payment is processed securely and the seller receives the funds in their connected bank account (minus a small processing fee). For bank transfers, customers pay directly to the seller's account."
      },
      {
        question: "Can I change my subscription plan?",
        answer: "Currently, SteerSolo offers one comprehensive plan at ₦1,000/month that includes all features. We're working on additional tiers with even more advanced features—stay tuned!"
      },
      {
        question: "Is there a setup fee?",
        answer: "No setup fees! You only pay the monthly subscription after your free trial. We also offer a professional setup service (₦5,000) where our team builds your complete store for you if you prefer a hands-off approach."
      },
      {
        question: "What is 'Pay Before Service' vs 'Pay After Service'?",
        answer: "'Pay Before Service' means customers complete payment before receiving their order—ideal for product sales. 'Pay After Service' (like cash on delivery) means customers pay after receiving their order—useful for services or building trust with new customers."
      }
    ]
  },
  {
    id: "trust-safety",
    name: "Trust & Safety",
    icon: Shield,
    faqs: [
      {
        question: "How are shops verified?",
        answer: "Shops earn 'Verified' status through consistent excellent performance: maintaining a 4+ star average rating, completing a high volume of successful orders (40+ daily), and having positive customer feedback. The verification badge signals trustworthiness to customers."
      },
      {
        question: "What makes a 'Verified Business' badge?",
        answer: "The Verified Business badge indicates a shop has: consistently high customer ratings, significant order volume, positive customer reviews, and a track record of reliable service. It's automatically awarded based on performance metrics."
      },
      {
        question: "Is my personal data safe?",
        answer: "Yes! We take data security seriously. We use industry-standard encryption (SSL/TLS), secure payment processing through Paystack, and never share your personal information with third parties. Your data is stored securely in the cloud with regular backups."
      },
      {
        question: "How do I report a problem or suspicious activity?",
        answer: "Use the 'Feedback' page to report any issues, suspicious shops, or concerns. Our team reviews all reports and takes appropriate action. You can also contact us directly via WhatsApp (+234 905 994 7055) or email (steerifygroup@gmail.com)."
      }
    ]
  },
  {
    id: "whatsapp-integration",
    name: "Using WhatsApp with SteerSolo",
    icon: Target,
    faqs: [
      {
        question: "How does SteerSolo work with WhatsApp?",
        answer: "SteerSolo is your backend engine for WhatsApp selling. When a customer orders from your SteerSolo store, you get notified on WhatsApp with full order details. You keep chatting with customers on WhatsApp while SteerSolo handles payments, catalogs, and order tracking behind the scenes."
      },
      {
        question: "Can I keep selling on WhatsApp and social media?",
        answer: "Absolutely — that's exactly how SteerSolo is designed! Use WhatsApp, Instagram, TikTok, and Twitter to connect with customers, then share your SteerSolo store link so they can browse, order, and pay securely. WhatsApp for relationships, SteerSolo for the business side."
      },
      {
        question: "How is SteerSolo different from a regular website builder?",
        answer: "Website builders like WordPress or Wix are general-purpose tools that require technical setup and hosting. SteerSolo is purpose-built for Nigerian small businesses: it's mobile-first, integrates with WhatsApp, supports Paystack and bank transfers in Naira, and you can set up a complete store in under 5 minutes — no coding needed."
      },
      {
        question: "What if I already have customers on WhatsApp?",
        answer: "That's perfect — SteerSolo is built to complement your existing WhatsApp relationships. Your customers keep chatting with you on WhatsApp as usual, but now you also have a professional product catalog, secure payment processing, order tracking, and sales analytics powering your business."
      }
    ]
  },
  {
    id: "technical",
    name: "Technical Support",
    icon: HelpCircle,
    faqs: [
      {
        question: "Why can't I see my products on my storefront?",
        answer: "Common reasons: (1) Your subscription may have expired—check your subscription status, (2) Products may be marked as 'out of stock'—update stock quantities, (3) Your shop may be inactive—activate it from 'My Store' page. If issues persist, contact support."
      },
      {
        question: "My payment failed. What should I do?",
        answer: "Try these steps: (1) Check your card/bank balance, (2) Ensure your card is enabled for online transactions, (3) Try a different payment method (card vs bank transfer), (4) Clear your browser cache and try again. If issues persist, contact your bank or our support team."
      },
      {
        question: "How do I reset my password?",
        answer: "Since SteerSolo uses passwordless login (OTP verification), you don't need to reset a password! Simply enter your email on the login page, and you'll receive a fresh OTP code. If you're having trouble receiving codes, check your spam folder or contact support."
      },
      {
        question: "The website isn't loading properly. What can I do?",
        answer: "Try: (1) Refreshing the page, (2) Clearing your browser cache and cookies, (3) Using a different browser (Chrome, Firefox, Safari), (4) Checking your internet connection, (5) Disabling browser extensions that might interfere. If problems persist, contact support."
      },
      {
        question: "Who do I contact for help?",
        answer: "Reach us through: Email: steerifygroup@gmail.com, WhatsApp: +234 905 994 7055, or use the Feedback form on our website. We typically respond within 24 hours on business days."
      }
    ]
  }
];

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    activeCategory === "all" || category.id === activeCategory
  ).filter(category => category.faqs.length > 0);

  const totalResults = filteredCategories.reduce((acc, cat) => acc + cat.faqs.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.05} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
              <HelpCircle className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold text-sm">HELP CENTER</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold">
              Frequently Asked{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
                Questions
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about SteerSolo. Can't find what you're looking for? 
              Contact our support team directly.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 focus:border-accent"
              />
            </div>
            
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      </section>

      <AdireDivider className="text-accent" />

      {/* Category Tabs and FAQ Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => setActiveCategory("all")}
              className="rounded-full"
            >
              All Topics
            </Button>
            {faqCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className="rounded-full gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </Button>
            ))}
          </div>

          {/* FAQ Accordions */}
          <div className="max-w-4xl mx-auto space-y-8">
            {filteredCategories.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find any FAQs matching "{searchQuery}". Try a different search term or browse by category.
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredCategories.map((category) => (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold">{category.name}</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-3">
                    {category.faqs.map((faq, idx) => (
                      <AccordionItem 
                        key={idx} 
                        value={`${category.id}-${idx}`}
                        className="border rounded-xl px-6 bg-card hover:bg-muted/50 transition-colors"
                      >
                        <AccordionTrigger className="text-left font-semibold py-4 hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <AdireDivider className="text-primary" />

      {/* Contact Support CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                Still have questions?
              </h2>
              
              <p className="text-muted-foreground max-w-lg mx-auto">
                Our support team is here to help! Reach out via WhatsApp for quick responses 
                or send us an email for detailed inquiries.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://wa.me/2349059947055" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white gap-2 w-full sm:w-auto">
                    <MessageCircle className="w-5 h-5" />
                    Chat on WhatsApp
                  </Button>
                </a>
                <a href="mailto:steerifygroup@gmail.com">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    Email Support
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Typical response time: Within 24 hours on business days
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
