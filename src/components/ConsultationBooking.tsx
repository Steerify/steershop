import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Video, Phone, MessageCircle, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import marketingServicesService from "@/services/marketing-services.service";

interface ConsultationBookingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string;
  shopName: string;
}

export const ConsultationBooking = ({
  open,
  onOpenChange,
  shopId,
  shopName,
}: ConsultationBookingProps) => {
  const { toast } = useToast();
  const [serviceType, setServiceType] = useState<string>("youtube_ads");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const services = [
    {
      id: "youtube_ads",
      title: "YouTube Ads",
      description: "Video advertising campaigns for brand awareness",
      icon: Video,
      price: "Starting from ₦50,000/month",
    },
    {
      id: "google_ads",
      title: "Google Ads",
      description: "Search and display advertising on Google",
      icon: Calendar,
      price: "Starting from ₦30,000/month",
    },
    {
      id: "consultation",
      title: "General Consultation",
      description: "Discuss your marketing needs with our team",
      icon: MessageCircle,
      price: "Free 30-minute session",
    },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await marketingServicesService.requestConsultation(shopId, serviceType, notes);
      setIsSuccess(true);
      
      toast({
        title: "Consultation Request Sent! 🎉",
        description: "Our team will contact you within 24-48 hours to schedule your consultation.",
      });
      
      // Reset after a delay
      setTimeout(() => {
        setIsSuccess(false);
        setNotes("");
        setServiceType("youtube_ads");
        onOpenChange(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error requesting consultation:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Request Submitted!</h3>
            <p className="text-muted-foreground">
              We'll contact you at your registered email within 24-48 hours.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book a Marketing Consultation</DialogTitle>
          <DialogDescription>
            Request a consultation to discuss paid advertising options for {shopName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Service Selection */}
          <div className="space-y-3">
            <Label>What service are you interested in?</Label>
            <RadioGroup value={serviceType} onValueChange={setServiceType}>
              {services.map((service) => (
                <label
                  key={service.id}
                  className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                    serviceType === service.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={service.id} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <service.icon className="w-4 h-4 text-primary" />
                      <span className="font-medium">{service.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <p className="text-sm font-medium text-primary mt-1">{service.price}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Tell us about your goals (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What are you hoping to achieve with advertising? Any specific budget or timeline?"
              rows={4}
            />
          </div>

          {/* Important Info */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">What happens next?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Our marketing team will review your request</li>
              <li>• We'll contact you within 24-48 hours</li>
              <li>• Schedule a convenient time for your consultation</li>
              <li>• Get a customized proposal for your business</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Request Consultation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
