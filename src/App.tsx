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
import { UserRole } from "@/types/api";

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
const AdminTopSeller = lazy(() => import("./pages/admin/AdminTopSeller"));
const AdminFeaturedShops = lazy(() => import("./pages/admin/AdminFeaturedShops"));
const Feedback = lazy(() => import("./pages/Feedback"));
const DemoStoreFront = lazy(() => import("./pages/DemoStoreFront"));
const Onboarding = lazy(() => import("./pages/entrepreneur/Onboarding"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Subscription = lazy(() => import("./pages/Subscription"));
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
        <GoogleOneTap />
        <SessionExpiryModal />
        <Suspense fallback={<PageLoadingSkeleton />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/auth/:type" element={<Auth />} />
            <Route path="/auth/callback" element={<Callback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/shop/:slug" element={<ShopStorefront />} />
            <Route path="/shop/:slug/product/:productId" element={<ProductDetails />} />
            <Route path="/demo" element={<DemoStoreFront />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/setup-service" element={<SetupService />} />
            <Route path="/feedback" element={<Feedback />} />
            
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
            <Route path="/bookings" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <Bookings />
              </ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute allowedRoles={[UserRole.ENTREPRENEUR]}>
                <Subscription />
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
