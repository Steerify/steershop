import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, CalendarCheck, Clock, CheckCircle, XCircle, MessageCircle, User, Phone, Mail, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

interface Booking {
  id: string;
  shop_id: string;
  service_id: string;
  customer_id: string | null;
  booking_date: string;
  booking_time: string;
  duration_minutes: number | null;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  created_at: string;
  products?: {
    name: string;
    price: number;
    image_url: string | null;
  };
}

const Bookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth(); // Using useAuth to get user and authLoading
  const [shop, setShop] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true); // This isLoading is for the bookings data, not auth
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (!authLoading) { // Wait for authLoading to be false
      if (user) {
        loadUserAndBookings();
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, authLoading, navigate]); // Dependencies for useEffect

  const loadUserAndBookings = async () => {
    try {
      if (!user) { // Use user from context
        setIsLoading(false); // Ensure loading state is cleared if no user
        return;
      }

      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (shopError || !shopData) {
        toast({
          title: "No Store Found",
          description: "Please create your store first",
        });
        navigate("/my-store");
        return;
      }

      setShop(shopData);
      await loadBookings(shopData.id);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading bookings",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookings = async (shopId: string) => {
    try {
      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select(`
          *,
          products (
            name,
            price,
            image_url
          )
        `)
        .eq("shop_id", shopId)
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      if (error) throw error;

      setBookings(bookingsData || []);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      toast({
        title: "Failed to load bookings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    setUpdatingBookingId(bookingId);
    
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === "confirmed") {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      } else if (status === "cancelled") {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Booking ${status}`,
      });

      await loadBookings(shop.id);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const openWhatsApp = (booking: Booking) => {
    const message = encodeURIComponent(
      `Hi ${booking.customer_name},\n\nThis is regarding your booking at ${shop?.shop_name}:\n\n` +
      `📅 Date: ${format(new Date(booking.booking_date), "MMM dd, yyyy")}\n` +
      `⏰ Time: ${booking.booking_time}\n` +
      `💇 Service: ${booking.products?.name || "Service"}\n\n` +
      `Please let me know if you have any questions!`
    );
    
    const phoneNumber = booking.customer_phone.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "confirmed":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "no_show":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "no_show":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  });

  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden">
            <img src={logo} alt="Loading" className="w-full h-full object-cover" />
          </div>
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bookings
          </h1>
          <p className="text-muted-foreground">Manage your service appointments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{confirmedCount}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-card border border-primary/10">
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedCount})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredBookings.length === 0 ? (
          <Card className="border-primary/10">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <CalendarCheck className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground">Bookings will appear here when customers book your services</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="border-primary/10 hover:shadow-lg hover:shadow-primary/5 transition-all">
                <CardHeader className="border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2 font-heading">
                        <Calendar className="w-5 h-5 text-primary" />
                        {format(new Date(booking.booking_date), "EEEE, MMMM dd, yyyy")}
                        <Badge variant="outline" className={getStatusColor(booking.status)}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-2 capitalize">{booking.status.replace(/_/g, ' ')}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.booking_time}
                        </span>
                        {booking.duration_minutes && (
                          <span>• {booking.duration_minutes} mins</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-heading font-bold text-primary">
                        ₦{booking.products?.price?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Service Info */}
                    <div className="flex items-start gap-3">
                      {booking.products?.image_url ? (
                        <img 
                          src={booking.products.image_url} 
                          alt={booking.products.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                          <CalendarCheck className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{booking.products?.name || "Service"}</p>
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{booking.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.customer_phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          disabled={updatingBookingId === booking.id}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          {updatingBookingId === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateBookingStatus(booking.id, "cancelled")}
                          disabled={updatingBookingId === booking.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, "completed")}
                          disabled={updatingBookingId === booking.id}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Completed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, "no_show")}
                          disabled={updatingBookingId === booking.id}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          No Show
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openWhatsApp(booking)}
                      className="border-green-500/30 text-green-600 hover:bg-green-500/10"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
