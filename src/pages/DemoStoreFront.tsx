import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Store, 
  ShoppingCart, 
  Star, 
  Package, 
  Sparkles, 
  Eye, 
  Search, 
  X, 
  Briefcase, 
  Clock,
  Calendar,
  Users,
  MessageCircle,
  Shield,
  Zap,
  Heart,
  CreditCard,
  Smartphone,
  CheckCircle,
  Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Demo data
const demoShop = {
  id: "demo-shop-123",
  shop_name: "Fashion By Chioma",
  shop_slug: "fashion-by-chioma",
  description: "Premium Nigerian fashion brand specializing in custom-made Ankara and lace outfits. Handcrafted with love and attention to detail.",
  logo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
  banner_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=400&fit=crop",
  average_rating: 4.8,
  total_reviews: 124,
  payment_method: "both",
  whatsapp_number: "+2348123456789",
  bank_account_name: "Chioma Nwosu",
  bank_name: "Access Bank",
  bank_account_number: "1234567890",
  paystack_public_key: "pk_test_demo_key_123"
};

const demoProducts = [
  {
    id: "1",
    name: "Ankara Maxi Dress",
    description: "Handmade Ankara maxi dress with modern cut. Perfect for weddings and special occasions.",
    price: 25000,
    stock_quantity: 15,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop",
    average_rating: 4.9,
    total_reviews: 47,
    type: 'product' as const,
    duration_minutes: null,
    booking_required: false
  },
  // ... other products (keep existing)
];

interface CartItem {
  product: typeof demoProducts[0];
  quantity: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  note: string;
}

const DemoStorefront = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(demoProducts);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    note: ""
  });
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'bank_transfer'>('paystack');

  useEffect(() => {
    let filtered = demoProducts;
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }
    
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.price.toString().includes(searchQuery)
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, typeFilter]);

  const addToCart = (product: typeof demoProducts[0]) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          toast({
            title: "Maximum Stock Reached",
            description: `Only ${product.stock_quantity} units available`,
            variant: "destructive",
          });
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, { product, quantity: 1 }];
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckout = async () => {
    // Validate customer info
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Create order summary
      const orderSummary = cart.map(item => 
        `${item.quantity}x ${item.product.name} - ₦${(item.product.price * item.quantity).toLocaleString()}`
      ).join('\n');
      
      const totalAmount = getTotalAmount();
      
      // Show success message with order details
      toast({
        title: "🎉 Order Placed Successfully!",
        description: (
          <div className="space-y-2">
            <p>Thank you for your order!</p>
            <p className="font-semibold">Total: ₦{totalAmount.toLocaleString()}</p>
            <p>This is a demo. In a real store, you would:</p>
            <ul className="list-disc pl-4 text-sm">
              <li>{paymentMethod === 'paystack' ? 'Process payment via Paystack' : 'Receive bank transfer details'}</li>
              <li>Get order confirmation on WhatsApp</li>
              <li>Receive order tracking information</li>
            </ul>
          </div>
        ),
        duration: 10000,
      });

      // Clear cart and close checkout
      clearCart();
      setIsCheckoutOpen(false);
      
      // Reset customer info
      setCustomerInfo({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        note: ""
      });

    }, 2000);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const productCount = demoProducts.filter(p => p.type === 'product').length;
  const serviceCount = demoProducts.filter(p => p.type === 'service').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Shop Header */}
      <div className="relative pt-20">
        {/* ... existing header code ... */}
      </div>

      {/* Demo Notice */}
      <div className="container mx-auto px-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500/10 to-primary/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Live Demo Store</h3>
              <p className="text-sm text-muted-foreground">
                This is an interactive demo showing how your SteerSolo store would look. 
                <Link to="/auth/signup" className="text-accent hover:underline ml-1">
                  Create your own store in minutes!
                </Link>
              </p>
            </div>
            <Link to="/auth/signup">
              <Button size="sm" className="bg-gradient-to-r from-accent to-primary">
                Start Free Trial
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <div className="flex-1 container mx-auto px-4 pb-20">
        {/* ... existing products section code ... */}

        {/* Floating Cart Button */}
        {getTotalItems() > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-accent to-primary hover:opacity-90 shadow-xl rounded-full px-6 py-6 h-auto animate-bounce shadow-accent/30"
                >
                  <ShoppingCart className="w-6 h-6 mr-2" />
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-semibold">₦{getTotalAmount().toLocaleString()}</span>
                    <span className="text-xs opacity-90">{getTotalItems()} items</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Checkout Demo
                  </DialogTitle>
                  <DialogDescription>
                    This is a demo checkout experience. In a real store, you would complete payment and receive order confirmation.
                  </DialogDescription>
                </DialogHeader>

                {/* Cart Items */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Order Summary</h3>
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                          {item.product.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ₦{item.product.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="h-7 w-7"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="h-7 w-7"
                          disabled={item.quantity >= item.product.stock_quantity}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Customer Information</h3>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+234 800 000 0000"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Input
                        id="address"
                        placeholder="123 Main Street, Lagos"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Lagos"
                          value={customerInfo.city}
                          onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="Lagos State"
                          value={customerInfo.state}
                          onChange={(e) => setCustomerInfo({...customerInfo, state: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">Order Note</Label>
                      <Input
                        id="note"
                        placeholder="Special instructions..."
                        value={customerInfo.note}
                        onChange={(e) => setCustomerInfo({...customerInfo, note: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Payment Method</h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as any)}
                    className="grid gap-3"
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="paystack" id="paystack" />
                      <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Paystack (Cards & Transfers)</p>
                            <p className="text-sm text-muted-foreground">Pay with card, bank transfer, or USSD</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium">Bank Transfer</p>
                            <p className="text-sm text-muted-foreground">Transfer directly to the seller's account</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'bank_transfer' && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Bank Transfer Details</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Bank:</span> {demoShop.bank_name}</p>
                          <p><span className="font-medium">Account Name:</span> {demoShop.bank_account_name}</p>
                          <p><span className="font-medium">Account Number:</span> {demoShop.bank_account_number}</p>
                          <p className="text-muted-foreground mt-2">
                            After payment, send proof to the seller on WhatsApp
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Order Summary */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{getTotalAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>₦1,500</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="gradient-text">₦{(getTotalAmount() + 1500).toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="flex-1"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing || cart.length === 0}
                    className="flex-1 bg-gradient-to-r from-accent to-primary"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Place Order (Demo)
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground pt-2">
                  This is a demo. No real payment will be processed.
                </p>
              </DialogContent>
            </Dialog>
          </div>
        )}



      </div>

      <Footer />
    </div>
  );
};

export default DemoStorefront;