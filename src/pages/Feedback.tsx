import { useState, useEffect } from "react";
import { useFormDraft, readFormDraft } from "@/hooks/useFormDraft";
import { ArrowLeft, Send, MessageSquare, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import feedbackService from "@/services/feedback.service";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { cn } from "@/lib/utils";

const Feedback = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState("complaint");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const feedbackData = { name, email, feedbackType, subject, message, rating };
  const draftKey = user?.id ? `feedback_draft_${user.id}` : "feedback_draft_guest";
  const { clearDraft } = useFormDraft(draftKey, feedbackData, true);

  // Restore draft on mount
  useEffect(() => {
    const draft = readFormDraft<typeof feedbackData>(draftKey);
    if (draft) {
      if (draft.name) setName(draft.name);
      if (draft.email) setEmail(draft.email);
      if (draft.feedbackType) setFeedbackType(draft.feedbackType);
      if (draft.subject) setSubject(draft.subject);
      if (draft.message) setMessage(draft.message);
      if (draft.rating) setRating(draft.rating);
    }
  }, [draftKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (trimmedSubject.length < 3 || trimmedMessage.length < 10) {
      toast({
        title: "A little more detail needed",
        description: "Use at least 3 characters for the subject and 10 for the message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await feedbackService.submitFeedback({
        customer_name: trimmedName,
        customer_email: trimmedEmail,
        feedback_type: feedbackType,
        subject: trimmedSubject,
        message: trimmedMessage,
        rating: rating > 0 ? rating : undefined,
      });

      toast({
        title: "Feedback submitted! 🎉",
        description: "Thank you! We'll review your feedback and get back to you soon.",
      });

      // Reset form
      setName("");
      setEmail("");
      setFeedbackType("complaint");
      setSubject("");
      setMessage("");
      setRating(0);
      clearDraft();
    } catch (error: unknown) {
      console.error("Feedback error:", error);
      toast({
        title: "Feedback not submitted",
        description: error instanceof Error ? error.message : "Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AdirePattern variant="geometric" className="fixed inset-0 opacity-5 pointer-events-none" />
      
      <Navbar />
      
      <div className="container max-w-2xl mx-auto px-4 py-8 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card id="feedback-form" className="border-primary/10 shadow-xl backdrop-blur-sm bg-card/95 scroll-mt-24">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-primary/20 rounded-tl-lg" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-accent/20 rounded-br-lg" />
          
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SteerSolo Feedback
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We value your feedback! Share complaints, suggestions, or upgrade requests.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedbackType">Feedback Type *</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger id="feedbackType" className="border-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complaint">🔴 Complaint</SelectItem>
                    <SelectItem value="upgrade_request">⬆️ Upgrade Request</SelectItem>
                    <SelectItem value="suggestion">💡 Suggestion</SelectItem>
                    <SelectItem value="other">📝 Other</SelectItem>
                  </SelectContent>
              </Select>
              </div>

              <div className="space-y-2">
                <Label>Rate Your Experience (Optional)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-colors",
                          (hoveredRating || rating) >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your feedback"
                  required
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide detailed information about your feedback..."
                  rows={6}
                  required
                  className="border-primary/20 focus:border-primary resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;
