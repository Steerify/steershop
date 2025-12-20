import { Step } from "react-joyride";

// Shop Owner Dashboard Tour
export const dashboardTourSteps: Step[] = [
  {
    target: "body",
    content: "Welcome to your SteerSolo Dashboard! This is your command center for managing your online store. Let me show you around.",
    title: "👋 Welcome to SteerSolo!",
    placement: "center",
    disableBeacon: true
  },
  {
    target: '[data-tour="subscription-status"]',
    content: "This shows your subscription status. You get a 7-day free trial to explore all features. After that, subscribe to keep your store active.",
    title: "📊 Subscription Status",
    placement: "bottom"
  },
  {
    target: '[data-tour="revenue-card"]',
    content: "Track your total revenue here. This updates automatically when customers make purchases and complete payments.",
    title: "💰 Revenue Tracking",
    placement: "bottom"
  },
  {
    target: '[data-tour="sales-card"]',
    content: "See how many orders you've received in the last 30 days. This helps you understand your sales performance.",
    title: "📈 Sales Analytics",
    placement: "bottom"
  },
  {
    target: '[data-tour="revenue-chart"]',
    content: "This chart shows your revenue trend over the last 7 days. Identify your busiest days and plan accordingly!",
    title: "📊 Revenue Trend",
    placement: "top"
  },
  {
    target: '[data-tour="quick-actions"]',
    content: "Use these quick actions to navigate to key areas: set up your store, add products, and manage orders.",
    title: "⚡ Quick Actions",
    placement: "top"
  },
  {
    target: '[data-tour="my-store-action"]',
    content: "Click here to customize your store's branding, add your logo, banner, and set up payment methods.",
    title: "🏪 My Store Settings",
    placement: "top"
  },
  {
    target: '[data-tour="products-action"]',
    content: "Add and manage your products and services here. You can set prices, stock levels, and images.",
    title: "📦 Products & Services",
    placement: "top"
  },
  {
    target: '[data-tour="orders-action"]',
    content: "View and manage all your customer orders. Update statuses, track payments, and communicate with customers.",
    title: "🛒 Order Management",
    placement: "top"
  }
];

// Products & Services Page Tour
export const productsTourSteps: Step[] = [
  {
    target: "body",
    content: "This is where you manage all your products and services. Let's learn how to add and organize your catalog!",
    title: "📦 Products & Services",
    placement: "center",
    disableBeacon: true
  },
  {
    target: '[data-tour="add-item-btn"]',
    content: "Click this button to add a new product or service to your store. You can switch between Product and Service types.",
    title: "➕ Add New Item",
    placement: "bottom"
  },
  {
    target: '[data-tour="type-filter"]',
    content: "Filter your catalog by type. View all items, just products, or just services.",
    title: "🔍 Filter by Type",
    placement: "bottom"
  },
  {
    target: '[data-tour="product-card"]',
    content: "Each card shows your product details including image, name, price, and stock. Click the buttons to edit or manage availability.",
    title: "🎴 Product Cards",
    placement: "top"
  },
  {
    target: '[data-tour="item-type-toggle"]',
    content: "When adding an item, choose 'Product' for physical goods or 'Service' for appointments and bookings.",
    title: "🔄 Product vs Service",
    placement: "bottom"
  }
];

// My Store Page Tour
export const myStoreTourSteps: Step[] = [
  {
    target: "body",
    content: "Welcome to your store settings! Here you can customize your store's appearance and set up how customers pay.",
    title: "🏪 My Store Settings",
    placement: "center",
    disableBeacon: true
  },
  {
    target: '[data-tour="store-name"]',
    content: "Enter your store name. This is what customers will see when they visit your shop.",
    title: "📝 Store Name",
    placement: "bottom"
  },
  {
    target: '[data-tour="store-url"]',
    content: "This is your unique store URL. Share this link with customers so they can visit your online store!",
    title: "🔗 Store URL",
    placement: "bottom"
  },
  {
    target: '[data-tour="store-logo"]',
    content: "Upload your store logo. A professional logo helps build trust with customers.",
    title: "🖼️ Store Logo",
    placement: "right"
  },
  {
    target: '[data-tour="store-banner"]',
    content: "Add a banner image to make your store stand out. This appears at the top of your storefront.",
    title: "🎨 Store Banner",
    placement: "left"
  },
  {
    target: '[data-tour="whatsapp-number"]',
    content: "Add your WhatsApp number so customers can contact you directly about their orders.",
    title: "📱 WhatsApp Contact",
    placement: "bottom"
  },
  {
    target: '[data-tour="payment-methods"]',
    content: "Set up how you'll receive payments. You can enable bank transfers and/or Paystack for instant payments.",
    title: "💳 Payment Methods",
    placement: "top"
  },
  {
    target: '[data-tour="store-sharing"]',
    content: "Share your store with customers! Copy your link, generate a QR code, or share directly to social media.",
    title: "📤 Share Your Store",
    placement: "top"
  }
];

// Orders Page Tour
export const ordersTourSteps: Step[] = [
  {
    target: "body",
    content: "Welcome to your Orders dashboard! This is where you manage all customer orders and track payments.",
    title: "🛒 Order Management",
    placement: "center",
    disableBeacon: true
  },
  {
    target: '[data-tour="order-card"]',
    content: "Each order card shows customer details, items purchased, and current status. Click to see more options.",
    title: "📋 Order Details",
    placement: "top"
  },
  {
    target: '[data-tour="order-status"]',
    content: "Track order status from pending to delivered. Update status as you process each order.",
    title: "📊 Order Status",
    placement: "left"
  },
  {
    target: '[data-tour="order-actions"]',
    content: "Use these action buttons to update status, mark as paid, contact customer via WhatsApp, or cancel the order.",
    title: "⚡ Quick Actions",
    placement: "top"
  },
  {
    target: '[data-tour="mark-paid"]',
    content: "When you receive payment, click 'Mark as Paid' to record the transaction and update your revenue.",
    title: "💰 Record Payments",
    placement: "left"
  },
  {
    target: '[data-tour="whatsapp-btn"]',
    content: "Quickly message customers on WhatsApp with order details pre-filled. Great for updates and confirmations!",
    title: "💬 WhatsApp Contact",
    placement: "left"
  }
];

// Customer Dashboard Tour
export const customerDashboardTourSteps: Step[] = [
  {
    target: "body",
    content: "Welcome to your customer dashboard! Here you can track orders, earn rewards, and access courses.",
    title: "👋 Welcome!",
    placement: "center",
    disableBeacon: true
  },
  {
    target: '[data-tour="stats-grid"]',
    content: "Your activity at a glance. See total orders, completed orders, reward points, and completed courses.",
    title: "📊 Your Stats",
    placement: "bottom"
  },
  {
    target: '[data-tour="reward-points"]',
    content: "Earn reward points by completing courses and engaging with the platform. Redeem them for prizes!",
    title: "🏆 Reward Points",
    placement: "bottom"
  },
  {
    target: '[data-tour="courses-card"]',
    content: "Complete courses to earn reward points. Click to browse available courses and start learning!",
    title: "📚 Courses",
    placement: "bottom"
  },
  {
    target: '[data-tour="recent-orders"]',
    content: "View your recent order history. Click 'View All Orders' to see your complete order history.",
    title: "🛍️ Recent Orders",
    placement: "top"
  }
];

// Storefront Tour (for customers)
export const storefrontTourSteps: Step[] = [
  {
    target: "body",
    content: "Welcome to this store! Browse products and services, add items to your cart, and checkout when ready.",
    title: "🛍️ Welcome to the Store!",
    placement: "center",
    disableBeacon: true
  },
  {
    target: '[data-tour="shop-header"]',
    content: "This is the store's profile with their logo, description, and ratings from other customers.",
    title: "🏪 Store Info",
    placement: "bottom"
  },
  {
    target: '[data-tour="search-products"]',
    content: "Use the search bar to find specific products or services by name, description, or price.",
    title: "🔍 Search Products",
    placement: "bottom"
  },
  {
    target: '[data-tour="product-filters"]',
    content: "Filter items to show All, Products only, or Services only. Makes it easy to find what you need!",
    title: "📂 Filter Items",
    placement: "bottom"
  },
  {
    target: '[data-tour="product-card"]',
    content: "Each item shows its image, name, price, and ratings. Products show stock, services show duration.",
    title: "🎴 Item Cards",
    placement: "top"
  },
  {
    target: '[data-tour="cart-button"]',
    content: "Your shopping cart! Add products and click here to review your items and proceed to checkout.",
    title: "🛒 Shopping Cart",
    placement: "left"
  }
];
