import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";
import { SessionExpiryModal } from "@/components/SessionExpiryModal";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PlatformReviewPopup } from "@/components/PlatformReviewPopup";
import { UserRole } from "@/types/api";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Callback from "@/pages/auth/Callback";
import NotFound from "./pages/NotFound";
// Add RoleSelection import
import RoleSelection from "./pages/auth/RoleSelection";

// Eager load frequently accessed pages for faster navigation
import Dashboard from "./pages/Dashboard";
import MyStore from "./pages/MyStore";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Shops from "./pages/Shops";

// Lazy load other pages for performance
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ShopStorefront = lazy(() => import("./pages/ShopStorefront"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Bookings = lazy(() => import("./pages/Bookings"));
const CustomerDashboard = lazy(() => import("./pages/customer/CustomerDashboard"));
const CustomerOrders = lazy(() => import("./pages/customer/CustomerOrders"));
const CustomerCourses = lazy(() => import("./pages/customer/CustomerCourses"));
const CustomerRewards = lazy(() => import("./pages/customer/CustomerRewards"));
const CustomerWishlist = lazy(() => import("./pages/customer/CustomerWishlist"));
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
const AdminTopSeller = lazy(() => import("./pages/admin/AdminTopSeller"));
const AdminFeaturedShops = lazy(() => import("./pages/admin/AdminFeaturedShops"));
const AdminActivityLogs = lazy(() => import("./pages/admin/AdminActivityLogs"));
const AdminMarketingConsultations = lazy(() => import("./pages/admin/AdminMarketingConsultations"));
const AdminPlatformEarnings = lazy(() => import("./pages/admin/AdminPlatformEarnings"));
const Feedback = lazy(() => import("./pages/Feedback"));
const DemoStoreFront = lazy(() => import("./pages/DemoStoreFront"));
const Onboarding = lazy(() => import("./pages/entrepreneur/Onboarding"));
const IdentityVerification = lazy(() => import("./pages/IdentityVerification"));
const Settings = lazy(() => import("./pages/Settings"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Subscription = lazy(() => import("./pages/Subscription"));
const SetupService = lazy(() => import("./pages/SetupService"));
const Marketing = lazy(() => import("./pages/entrepreneur/Marketing"));
const MarketingServices = lazy(() => import("./pages/entrepreneur/MarketingServices"));
const PosterEditor = lazy(() => import("./pages/entrepreneur/PosterEditor"));
const EntrepreneurCourses = lazy(() => import("./pages/entrepreneur/EntrepreneurCourses"));
const Customers = lazy(() => import("./pages/Customers"));
const FAQ = lazy(() => import("./pages/FAQ"));

// Feature pages
const WhatsAppFeature = lazy(() => import("./pages/features/WhatsAppFeature"));
const GrowthFeature = lazy(() => import("./pages/features/GrowthFeature"));
const TrustFeature = lazy(() => import("./pages/features/TrustFeature"));
const PaymentsFeature = lazy(() => import("./pages/features/PaymentsFeature"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000,   // Cache retained for 10 minutes
      refetchOnWindowFocus: false, // Prevent refetch on tab focus
      retry: 1, // Only retry once on failure
    },
  },
});

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
        <GoogleOneTap />
        <SessionExpiryModal />
        <PlatformReviewPopup />
        <Suspense fallback={<PageLoadingSkeleton />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/auth/:type" element={<Auth />} />
            <Route path="/auth/callback" element={<Callback />} />
            {/* Add RoleSelection route - this is public but only accessible after signup */}
            <Route path="/select-role" element={<RoleSelection />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/shop/:slug" element={<ShopStorefront />} />
            <Route path="/s/:slug" element={<ShopStorefront />} />
            <Route path="/shop/:slug/product/:productId" element={<ProductDetails />} />
            <Route path="/demo" element={<DemoStoreFront />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/setup-service" element={<SetupService />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/faq" element={<FAQ />} />
            
            {/* Feature pages */}
            <Route path="/features/whatsapp" element={<WhatsAppFeature />} />
            <Route path="/features/growth" element={<GrowthFeature />} />
            <Route path="/features/trust" element={<TrustFeature />} />
            <Route path="/features/payments" element={<PaymentsFeature />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/security" element={<SecurityPage />} />
            
            {/* Shop owner routes */}
            <Route path="/onboarding" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-store" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <MyStore />
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <Products />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/identity-verification" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <IdentityVerification />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <Bookings />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR, UserRole.CUSTOMER]}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/marketing" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <Marketing />
              </ProtectedRoute>
            } />
            <Route path="/marketing/editor/:id?" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <PosterEditor />
              </ProtectedRoute>
            } />
            <Route path="/marketing-services" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <MarketingServices />
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <EntrepreneurCourses />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <Customers />
              </ProtectedRoute>
            } />
            
            {/* Customer routes */}
            <Route path="/customer_dashboard" element={
              <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/customer/orders" element={
              <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                <CustomerOrders />
              </ProtectedRoute>
            } />
            <Route path="/customer/courses" element={
              <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                <CustomerCourses />
              </ProtectedRoute>
            } />
            <Route path="/customer/rewards" element={
              <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                <CustomerRewards />
              </ProtectedRoute>
            } />
            <Route path="/customer/wishlist" element={
              <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                <CustomerWishlist />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/shops" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminShops />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminProducts />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/courses" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminCourses />
              </ProtectedRoute>
            } />
            <Route path="/admin/prizes" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminPrizes />
              </ProtectedRoute>
            } />
            <Route path="/admin/offers" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminOffers />
              </ProtectedRoute>
            } />
            <Route path="/admin/referrals" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminReferrals />
              </ProtectedRoute>
            } />
            <Route path="/admin/top-sellers" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminTopSeller />
              </ProtectedRoute>
            } />
            <Route path="/admin/featured-shops" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminFeaturedShops />
              </ProtectedRoute>
            } />
            <Route path="/admin/feedback" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminFeedback />
              </ProtectedRoute>
            } />
            <Route path="/admin/activity-logs" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminActivityLogs />
              </ProtectedRoute>
            } />
            <Route path="/admin/marketing" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminMarketingConsultations />
              </ProtectedRoute>
            } />
            <Route path="/admin/earnings" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminPlatformEarnings />
              </ProtectedRoute>
            } />
            
            
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