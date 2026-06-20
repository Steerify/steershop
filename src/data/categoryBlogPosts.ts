import { CATEGORIES } from "@/components/MarketplaceFilters";

export interface BlogPost {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  ctaText: string;
  ctaLink: string;
  featuredImage?: string;
}

export const CATEGORY_BLOG_POSTS: Record<string, BlogPost> = {
  fashion: {
    title: "Revolutionizing Nigerian Fashion: How SteerSolo Empowers Local Designers",
    excerpt: "Discover how SteerSolo is transforming Nigeria's fashion industry by connecting independent designers with fashion-forward customers across the nation.",
    content: "Nigeria's fashion scene is booming, and SteerSolo is at the forefront of this revolution. Our platform provides a global stage for local designers, tailors, and fashion entrepreneurs to showcase their unique creations to a wider audience than ever before.\n\nFrom Ankara prints to contemporary streetwear, SteerSolo hosts a diverse range of fashion styles that celebrate Nigerian culture and creativity. By joining our platform, fashion sellers gain access to tools that help them manage inventory, process orders, and build lasting relationships with their customers.",
    author: "Chioma Okonkwo",
    date: "June 15, 2026",
    readTime: "5 min read",
    tags: ["Fashion", "Nigerian Designers", "E-commerce"],
    ctaText: "Start Your Fashion Store Today",
    ctaLink: "/signup?role=entrepreneur",
  },
  beauty: {
    title: "Beauty and Wellness in Nigeria: A Journey to Self-Care Excellence",
    excerpt: "Explore how SteerSolo is elevating the beauty and wellness industry in Nigeria with trusted sellers and quality products.",
    content: "SteerSolo is proud to be Nigeria's most trusted marketplace for beauty and wellness products. Our platform features verified sellers offering everything from natural skincare to professional makeup, all backed by our SafeBeauty verification program.\n\nWe believe that everyone deserves access to safe, high-quality beauty products. That's why we work closely with sellers to ensure authenticity and quality, giving customers peace of mind with every purchase.",
    author: "Aisha Mohammed",
    date: "June 12, 2026",
    readTime: "4 min read",
    tags: ["Beauty", "Wellness", "SafeBeauty"],
    ctaText: "Join Our Beauty Community",
    ctaLink: "/signup?role=entrepreneur",
  },
  skincare: {
    title: "Glow Naturally: The Rise of Nigerian Skincare Brands",
    excerpt: "From shea butter to moringa, discover how local skincare brands on SteerSolo are harnessing Nigeria's natural ingredients.",
    content: "Nigeria is blessed with an abundance of natural ingredients that have been used for centuries in skincare. SteerSolo is proud to feature local brands that are blending traditional knowledge with modern science to create effective, natural skincare products.\n\nOur platform offers everything from African black soap to turmeric serums, all from verified sellers who prioritize quality and authenticity.",
    author: "Fatima Abdullahi",
    date: "June 10, 2026",
    readTime: "3 min read",
    tags: ["Skincare", "Natural Beauty", "Local Ingredients"],
    ctaText: "Launch Your Skincare Brand",
    ctaLink: "/signup?role=entrepreneur",
  },
  haircare: {
    title: "Celebrating Nigerian Hair: From Traditional Styles to Modern Trends",
    excerpt: "Explore the vibrant world of Nigerian haircare on SteerSolo, featuring everything from natural hair products to professional salon services.",
    content: "Nigerian hair culture is rich and diverse, and SteerSolo is your one-stop destination for all things hair. Whether you're looking for quality hair extensions, natural hair products, or professional salon services, you'll find it all on our platform.\n\nFrom braids to locs, we celebrate the beauty and versatility of Nigerian hair. Our verified sellers offer products that cater to all hair types and textures.",
    author: "Zara Chukwu",
    date: "June 8, 2026",
    readTime: "4 min read",
    tags: ["Haircare", "Natural Hair", "Beauty"],
    ctaText: "Start Your Haircare Business",
    ctaLink: "/signup?role=entrepreneur",
  },
  cosmetics: {
    title: "Makeup Magic: Nigerian Cosmetics Brands You Need to Know",
    excerpt: "Discover the incredible range of cosmetics brands on SteerSolo, from bold lipsticks to radiant foundations perfect for Nigerian skin tones.",
    content: "The Nigerian cosmetics industry is flourishing, and SteerSolo is proud to showcase the best local brands. Our platform features cosmetics specifically formulated for Nigerian skin tones, ensuring that everyone can find products that make them look and feel their best.\n\nFrom everyday makeup to glamorous looks for special occasions, our sellers offer everything you need to create your perfect look.",
    author: "Amara Okafor",
    date: "June 5, 2026",
    readTime: "3 min read",
    tags: ["Cosmetics", "Makeup", "Beauty"],
    ctaText: "Sell Your Cosmetics on SteerSolo",
    ctaLink: "/signup?role=entrepreneur",
  },
  fragrances: {
    title: "Scent of Success: Nigeria's Thriving Fragrance Industry",
    excerpt: "From traditional attars to modern perfumes, explore the wonderful world of fragrances available on SteerSolo.",
    content: "Nigeria has a rich history of fragrance, from traditional attars to contemporary perfumes. SteerSolo brings this heritage to your fingertips with a wide range of fragrances from local artisans and international brands.\n\nWhether you prefer bold, statement scents or subtle, everyday fragrances, you'll find the perfect scent on our platform.",
    author: "Damilola Adebayo",
    date: "June 3, 2026",
    readTime: "3 min read",
    tags: ["Fragrances", "Perfumes", "Beauty"],
    ctaText: "Share Your Scents with the World",
    ctaLink: "/signup?role=entrepreneur",
  },
  "natural-beauty": {
    title: "Natural Beauty Revolution: Embracing Nigeria's Herbal Traditions",
    excerpt: "Discover how SteerSolo is promoting natural and organic beauty products rooted in Nigerian herbal traditions.",
    content: "Nigeria has a long history of using natural ingredients for beauty and wellness. SteerSolo is proud to support sellers who carry on this tradition by offering natural, organic, and handmade beauty products.\n\nFrom shea butter to aloe vera, our platform features products that harness the power of nature to nourish and beautify.",
    author: "Ifeoma Nwankwo",
    date: "June 1, 2026",
    readTime: "4 min read",
    tags: ["Natural Beauty", "Organic", "Herbal"],
    ctaText: "Join the Natural Beauty Movement",
    ctaLink: "/signup?role=entrepreneur",
  },
  electronics: {
    title: "Tech for All: How SteerSolo is Making Electronics Accessible Across Nigeria",
    excerpt: "From smartphones to solar solutions, explore how SteerSolo is connecting Nigerians with quality electronics and tech gadgets.",
    content: "Technology is transforming lives across Nigeria, and SteerSolo is making quality electronics accessible to everyone. Our platform features verified sellers offering everything from smartphones and laptops to solar panels and inverters.\n\nWhether you're looking for the latest tech gadgets or reliable electronics for your business, SteerSolo has you covered.",
    author: "Tunde Balogun",
    date: "May 28, 2026",
    readTime: "5 min read",
    tags: ["Electronics", "Technology", "Gadgets"],
    ctaText: "Start Selling Electronics Today",
    ctaLink: "/signup?role=entrepreneur",
  },
  "food-drinks": {
    title: "Taste of Nigeria: Celebrating Our Rich Culinary Heritage",
    excerpt: "From jollof rice to suya, explore how SteerSolo is bringing the best of Nigerian cuisine to your doorstep.",
    content: "Nigerian cuisine is beloved around the world, and SteerSolo is proud to be the go-to marketplace for food and drinks across the country. Whether you're craving traditional dishes or contemporary treats, you'll find it all on our platform.\n\nFrom fresh produce to packaged snacks, our verified sellers offer a wide range of food and drinks to satisfy every taste.",
    author: "Bolanle Adeyemi",
    date: "May 25, 2026",
    readTime: "4 min read",
    tags: ["Food & Drinks", "Nigerian Cuisine", "Culinary"],
    ctaText: "Share Your Culinary Creations",
    ctaLink: "/signup?role=entrepreneur",
  },
  "home-living": {
    title: "Making a House a Home: Interior Design and Home Goods in Nigeria",
    excerpt: "Discover how SteerSolo is helping Nigerians create beautiful, comfortable homes with quality furniture and decor.",
    content: "Your home is your sanctuary, and SteerSolo is here to help you make it beautiful. Our platform offers a wide range of home goods, from furniture and decor to cleaning products and household essentials.\n\nWhether you're moving into a new home or just looking to refresh your space, you'll find everything you need on SteerSolo.",
    author: "Funke Osinowo",
    date: "May 22, 2026",
    readTime: "4 min read",
    tags: ["Home & Living", "Interior Design", "Furniture"],
    ctaText: "Launch Your Home Goods Store",
    ctaLink: "/signup?role=entrepreneur",
  },
  "art-craft": {
    title: "Creative Expressions: Supporting Nigerian Artists and Craftsmen",
    excerpt: "Explore how SteerSolo is providing a platform for Nigerian artists and craftsmen to showcase and sell their work.",
    content: "Nigeria has a vibrant arts and crafts scene, and SteerSolo is proud to support local artists and craftsmen. From handcrafted beads to beautiful paintings, our platform features unique, one-of-a-kind creations from talented artisans across the country.\n\nBy shopping on SteerSolo, you're not just buying beautiful products – you're supporting Nigerian creativity and entrepreneurship.",
    author: "Emeka Okafor",
    date: "May 20, 2026",
    readTime: "4 min read",
    tags: ["Art & Craft", "Artists", "Handmade"],
    ctaText: "Showcase Your Art on SteerSolo",
    ctaLink: "/signup?role=entrepreneur",
  },
  services: {
    title: "Powering Nigerian Businesses: Professional Services on SteerSolo",
    excerpt: "From photography to logistics, discover the wide range of professional services available on SteerSolo.",
    content: "SteerSolo isn't just for physical products – we're also a platform for professional services. Whether you need photography for your event, logistics for your business, or digital services like graphic design, you'll find verified service providers on our platform.\n\nBy connecting service providers with clients across Nigeria, SteerSolo is helping to grow the country's professional services industry.",
    author: "Kelechi Nwachukwu",
    date: "May 17, 2026",
    readTime: "5 min read",
    tags: ["Services", "Professional", "Business"],
    ctaText: "Offer Your Services Today",
    ctaLink: "/signup?role=entrepreneur",
  },
  other: {
    title: "Join the SteerSolo Revolution: Start Your Business Journey Today",
    excerpt: "No matter what you sell, SteerSolo provides the tools and support you need to build a successful business in Nigeria.",
    content: "SteerSolo is Nigeria's most trusted marketplace, and we welcome sellers from all industries. Whether you're selling physical products, digital goods, or professional services, our platform provides everything you need to start, grow, and manage your business.\n\nWith our easy-to-use tools, secure payment system, and dedicated support, you can focus on what matters most – serving your customers.",
    author: "SteerSolo Team",
    date: "June 18, 2026",
    readTime: "3 min read",
    tags: ["Entrepreneurship", "Business", "SteerSolo"],
    ctaText: "Start Your SteerSolo Store Now",
    ctaLink: "/signup?role=entrepreneur",
  },
};

export function getBlogPostForCategory(category: string): BlogPost {
  if (CATEGORY_BLOG_POSTS[category]) {
    return CATEGORY_BLOG_POSTS[category];
  }
  
  // For beauty subcategories, fall back to beauty blog post
  const beautySubcategories = ['skincare', 'haircare', 'cosmetics', 'fragrances', 'natural-beauty'];
  if (beautySubcategories.includes(category)) {
    return CATEGORY_BLOG_POSTS.beauty;
  }
  
  // Default to "other" blog post
  return CATEGORY_BLOG_POSTS.other;
}
