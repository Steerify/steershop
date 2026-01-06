import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Callback from "@/pages/auth/Callback";
import NotFound from "./pages/NotFound";

// Lazy load other pages for performance
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Shops = lazy(() => import("./pages/Shops"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ShopStorefront = lazy(() => import("./pages/ShopStorefront"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyStore = lazy(() => import("./pages/MyStore"));
const Products = lazy(() => import("./pages/Products"));
const Orders = lazy(() => import("./pages/Orders"));
const Bookings = lazy(() => import("./pages/Bookings"));
const CustomerDashboard = lazy(() => import("./pages/customer/CustomerDashboard"));
const CustomerOrders = lazy(() => import("./pages/customer/CustomerOrders"));
const CustomerCourses = lazy(() => import("./pages/customer/CustomerCourses"));
const CustomerRewards = lazy(() => import("./pages/customer/CustomerRewards"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminShops = lazy(() => import("./pages/admin/AdminShops"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminOffers = lazy(() => import("./pages/admin/AdminOffers"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminPrizes = lazy(() => import("./pages/admin/AdminPrizes"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));
const AdminReferrals = lazy(() => import("./pages/admin/AdminReferrals"));
const Feedback = lazy(() => import("./pages/Feedback"));
const DemoStoreFront = lazy(() => import("./pages/DemoStoreFront"));
const Onboarding = lazy(() => import("./pages/entrepreneur/Onboarding"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Pricing = lazy(() => import("./pages/Pricing"));
const SetupService = lazy(() => import("./pages/SetupService"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Suspense fallback={<PageLoadingSkeleton />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/auth/:type" element={<Auth />} />
            <Route path="/auth/callback" element={<Callback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/shop/:slug" element={<ShopStorefront />} />
            <Route path="/shop/:slug/product/:productId" element={<ProductDetails />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-store" element={<MyStore />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/demo" element={<DemoStoreFront />} />
            <Route path="/customer_dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/orders" element={<CustomerOrders />} />
            <Route path="/customer/courses" element={<CustomerCourses />} />
            <Route path="/customer/rewards" element={<CustomerRewards />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/shops" element={<AdminShops />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/prizes" element={<AdminPrizes />} />
            <Route path="/admin/offers" element={<AdminOffers />} />
            <Route path="/admin/referrals" element={<AdminReferrals />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/setup-service" element={<SetupService />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;