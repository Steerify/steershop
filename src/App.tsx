import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Callback from "@/pages/auth/Callback";
import ResetPassword from "./pages/ResetPassword";
import Shops from "./pages/Shops";
import AboutPage from "./pages/AboutPage";
import ShopStorefront from "./pages/ShopStorefront";
import ProductDetails from "./pages/ProductDetails";
import Dashboard from "./pages/Dashboard";
import MyStore from "./pages/MyStore";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Bookings from "./pages/Bookings";
import NotFound from "./pages/NotFound";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerOrders from "./pages/customer/CustomerOrders";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminShops from "./pages/admin/AdminShops";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminPrizes from "./pages/admin/AdminPrizes";
import CustomerCourses from "./pages/customer/CustomerCourses";
import CustomerRewards from "./pages/customer/CustomerRewards";
import Feedback from "./pages/Feedback";
import AdminFeedback from "./pages/admin/AdminFeedback";
import DemoStoreFront from "./pages/DemoStoreFront";
import Onboarding from "./pages/entrepreneur/Onboarding";

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
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;