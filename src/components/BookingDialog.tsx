import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Clock, User, Mail, Phone, MessageSquare, Loader2, CheckCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  image_url: string | null;
}

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  shopId: string;
  shopName: string;
  whatsappNumber?: string;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export const BookingDialog = ({ 
  isOpen, 
  onClose, 
  service, 
  shopId, 
  shopName,
  whatsappNumber 
}: BookingDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<'datetime' | 'details' | 'confirm' | 'success'>("datetime");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    notes: ""
  });

  const handleNext = () => {
    if (step === "datetime") {
      if (!selectedDate || !selectedTime) {
        toast({
          title: "Select Date & Time",
          description: "Please select a date and time for your appointment",
          variant: "destructive"
        });
        return;
      }
      setStep("details");
    } else if (step === "details") {
      if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
        toast({
          title: "Required Fields",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "details") setStep("datetime");
    if (step === "confirm") setStep("details");
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setIsSubmitting(true);
    
    try {
      // Use user from context
      
      const { error } = await supabase
        .from("bookings")
        .insert({
          shop_id: shopId,
          service_id: service.id,
          customer_id: user?.id || null,
          booking_date: format(selectedDate, "yyyy-MM-dd"),
          booking_time: selectedTime,
          duration_minutes: service.duration_minutes,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          notes: formData.notes || null,
          status: "pending"
        });

      if (error) throw error;

      setStep("success");
      
      toast({
        title: "Booking Confirmed! 🎉",
        description: "Your appointment has been scheduled successfully."
      });

    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (!whatsappNumber) return;
    
    const message = encodeURIComponent(
      `Hi! I just booked an appointment for ${service.name} on ${selectedDate ? format(selectedDate, "MMMM dd, yyyy") : ""} at ${selectedTime}. My name is ${formData.customer_name}. Looking forward to it!`
    );
    
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, "_blank");
  };

  const handleClose = () => {
    setStep("datetime");
    setSelectedDate(undefined);
    setSelectedTime("");
    setFormData({ customer_name: "", customer_email: "", customer_phone: "", notes: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            Book Appointment
          </DialogTitle>
          <DialogDescription>
            {service.name} at {shopName}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {["datetime", "details", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step === s ? "bg-primary text-primary-foreground" :
                ["details", "confirm", "success"].indexOf(step) > i ? "bg-primary/20 text-primary" :
                "bg-muted text-muted-foreground"
              )}>
                {i + 1}
              </div>
              {i < 2 && <div className={cn(
                "w-8 h-0.5",
                ["details", "confirm", "success"].indexOf(step) > i ? "bg-primary" : "bg-muted"
              )} />}
            </div>
          ))}
        </div>

        {/* Step 1: Date & Time */}
        {step === "datetime" && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-2 block">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-base font-semibold mb-2 block">Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {service.duration_minutes && (
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Duration: <span className="font-semibold text-foreground">{service.duration_minutes} minutes</span>
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleNext} className="bg-gradient-to-r from-primary to-accent">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Customer Details */}
        {step === "details" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name *
              </Label>
              <Input
                id="name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} className="bg-gradient-to-r from-primary to-accent">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === "confirm" && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold">Booking Summary</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{selectedDate && format(selectedDate, "MMMM dd, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                {service.duration_minutes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{service.duration_minutes} mins</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Price:</span>
                    <span className="font-bold text-primary">₦{service.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 rounded-xl p-4">
              <h4 className="font-semibold mb-2">Your Details</h4>
              <div className="space-y-1 text-sm">
                <p>{formData.customer_name}</p>
                <p className="text-muted-foreground">{formData.customer_email}</p>
                <p className="text-muted-foreground">{formData.customer_phone}</p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="bg-gradient-to-r from-primary to-accent"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            
            <div>
              <h3 className="text-xl font-heading font-bold mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                Your appointment for <strong>{service.name}</strong> has been scheduled for{" "}
                <strong>{selectedDate && format(selectedDate, "MMMM dd, yyyy")}</strong> at <strong>{selectedTime}</strong>.
              </p>
            </div>

            <div className="pt-4 space-y-2">
              {whatsappNumber && (
                <Button 
                  variant="outline" 
                  className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  onClick={handleWhatsAppContact}
                >
                  Contact via WhatsApp
                </Button>
              )}
              <Button onClick={handleClose} className="w-full bg-gradient-to-r from-primary to-accent">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
