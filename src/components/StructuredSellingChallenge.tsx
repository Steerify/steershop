import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Circle, Trophy, Star, ArrowRight, Lock, Unlock, Calendar, Layout, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChallengeDay {
  day: number;
  title: string;
  task: string;
  mindset: string;
  action: string;
}

const challengeData: Record<string, ChallengeDay[]> = {
  "Week 1 — Structure Your Foundation": [
    { day: 1, title: "Declare the Shift", task: "Post: 'I’m switching from manual selling to structured selling.'", mindset: "Identity shift starts here.", action: "Complete store setup." },
    { day: 2, title: "Product Clarity", task: "Add clear names, prices, and descriptions.", mindset: "No more 'DM for price.'", action: "Review all products." },
    { day: 3, title: "Image Cleanup", task: "Upload clean product images.", mindset: "Clear visuals increase trust.", action: "Upload 3+ clean photos." },
    { day: 4, title: "Payment Setup", task: "Connect payment integration.", mindset: "No more 'send screenshot.'", action: "Verify payment settings." },
    { day: 5, title: "Generate Your Link", task: "Save it. Pin it. Use it.", mindset: "This is your professional ID.", action: "Copy store link." },
    { day: 6, title: "Bio Update", task: "Add store link to Instagram, WhatsApp, and TikTok.", mindset: "Consistency build trust.", action: "Update all bios." },
    { day: 7, title: "Sunday Reset", task: "Share your store publicly.", mindset: "Show the world you're open.", action: "Public announcement." }
  ],
  "Week 2 — Install Daily Habits": [
    { day: 8, title: "Morning Order Check", task: "Check dashboard before replying DMs.", mindset: "Data first, chat later.", action: "Log into dashboard." },
    { day: 9, title: "Stop Explaining Prices", task: "Only send your link.", mindset: "Time is money.", action: "Send link to 3 customers." },
    { day: 10, title: "One Link Lifestyle", task: "Reply to 'How much?' with the full link.", mindset: "Structure beats stress.", action: "Practice link replies." },
    { day: 11, title: "Clean Your WhatsApp", task: "Archive messy chats. Turn WhatsApp into an inbox.", mindset: "Professional workspace.", action: "Clean 10+ chats." },
    { day: 12, title: "Story Posting Habit", task: "Post 1 product with link sticker.", mindset: "Daily visibility.", action: "Post to stories." },
    { day: 13, title: "Broadcast with Structure", task: "Send: 'Shop here -> [link]'", mindset: "Less is more.", action: "Send broadcast." },
    { day: 14, title: "Weekly Review", task: "Count orders, conversations saved, and stress levels.", mindset: "Progress is addictive.", action: "Record weekly stats." }
  ],
  "Week 3 — Professional Mode": [
    { day: 15, title: "Raise Your Standards", task: "No unpaid reservations.", mindset: "A business, not a hobby.", action: "Set policy." },
    { day: 16, title: "Clear Policies", task: "Add delivery info on store.", mindset: "Remove confusion.", action: "Update delivery info." },
    { day: 17, title: "Remove Friction", task: "Make checkout simple.", mindset: "Seamless experience.", action: "Test checkout flow." },
    { day: 18, title: "Feature Best Sellers", task: "Highlight top products.", mindset: "Sell what people want.", action: "Pin top 3 products." },
    { day: 19, title: "Improve Descriptions", task: "Answer common questions inside store.", mindset: "Reduce support DMs.", action: "Update 5 descriptions." },
    { day: 20, title: "Look Like a Brand", task: "Consistent pricing and layout.", mindset: "Visual professionality.", action: "Audit shop layout." },
    { day: 21, title: "Public Identity Shift", task: "Post: 'Structured selling changed my business.'", mindset: "Own your success.", action: "Final week prep." }
  ],
  "Week 4 — Scale & Stability": [
    { day: 22, title: "Automate Replies", task: "Use saved replies that include link.", mindset: "System > effort.", action: "Set up 3 templates." },
    { day: 23, title: "Track Repeat Buyers", task: "Notice patterns.", mindset: "Retention is king.", action: "Review customer list." },
    { day: 24, title: "Optimize One Thing", task: "Better image, description, or headline.", mindset: "Kaizen - continuous improvement.", action: "Improve 1 product." },
    { day: 25, title: "Repost Store Link", task: "Remind audience.", mindset: "Out of sight, out of mind.", action: "Social repost." },
    { day: 26, title: "Promote Hard", task: "Drive traffic to store.", mindset: "Aggressive growth.", action: "Run a 'One Day' promotion." },
    { day: 27, title: "Eliminate Time-Wasters", task: "No more price typing or manual confirmation.", mindset: "Total dependency on system.", action: "Say no to manual sales." },
    { day: 28, title: "Sunday Store Reset", task: "Update featured items.", mindset: "Fresh for Monday.", action: "Shop refresh." },
    { day: 29, title: "Measure Growth", task: "Compare: Before challenge vs now.", mindset: "Numbers don't lie.", action: "Growth calc." },
    { day: 30, title: "Graduation Day", task: "Post: 'I completed 30 Days to Structured Selling.'", mindset: "You are a Structured Seller.", action: "Unlock Badge." }
  ]
};

export const StructuredSellingChallenge = () => {
  const { toast } = useToast();
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('steersolo_challenge_progress');
    if (saved) {
      try {
        setCompletedDays(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse challenge progress", e);
      }
    }
    
    // Default to current week based on progress
    const lastDay = completedDays.length > 0 ? Math.max(...completedDays) : 0;
    if (lastDay < 7) setExpandedWeek("Week 1 — Structure Your Foundation");
    else if (lastDay < 14) setExpandedWeek("Week 2 — Install Daily Habits");
    else if (lastDay < 21) setExpandedWeek("Week 3 — Professional Mode");
    else setExpandedWeek("Week 4 — Scale & Stability");
  }, []);

  const toggleDay = (day: number) => {
    const newCompleted = completedDays.includes(day)
      ? completedDays.filter(d => d !== day)
      : [...completedDays, day];
    
    setCompletedDays(newCompleted);
    localStorage.setItem('steersolo_challenge_progress', JSON.stringify(newCompleted));

    if (!completedDays.includes(day)) {
      toast({
        title: `Day ${day} Completed! 🎉`,
        description: "One step closer to becoming a Structured Seller.",
      });
    }
  };

  const calculateProgress = () => (completedDays.length / 30) * 100;

  return (
    <Card className="w-full border-none shadow-2xl bg-background rounded-3xl overflow-hidden">
      <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-gold" />
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              <CardTitle className="text-xl md:text-2xl font-bold">30 Days to Structured Selling</CardTitle>
            </div>
            <CardDescription className="text-sm font-medium">
              “Move from chaotic WhatsApp selling to professional brand stability.”
            </CardDescription>
          </div>
          <div className="shrink-0 text-center">
             <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 rotate-[-90deg]">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/30" />
                  <circle 
                    cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - completedDays.length / 30)}
                  />
                </svg>
                <span className="absolute text-xs font-black">{Math.round(calculateProgress())}%</span>
             </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
           <span>{completedDays.length} / 30 Days</span>
           <span>Badge: {completedDays.length === 30 ? "🟢 Structured Seller" : "InProgress"}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4">
        {Object.entries(challengeData).map(([week, days], weekIdx) => {
          const isExpanded = expandedWeek === week;
          const weekCompleted = days.every(d => completedDays.includes(d.day));
          const weekIcons = [Layout, Calendar, ShieldCheck, TrendingUp];
          const Icon = weekIcons[weekIdx];

          return (
            <div key={week} className={cn(
              "rounded-2xl border transition-all duration-300",
              isExpanded ? "border-primary/20 bg-primary/5 shadow-inner" : "border-border/50 hover:border-primary/10"
            )}>
              <button 
                onClick={() => setExpandedWeek(isExpanded ? null : week)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    weekCompleted ? "bg-green-100 text-green-600" : isExpanded ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base leading-tight">{week}</h4>
                    <p className="text-xs text-muted-foreground">
                      {days.filter(d => completedDays.includes(d.day)).length} of 7 tasks done
                    </p>
                  </div>
                </div>
                {weekCompleted ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <ArrowRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 animate-slide-up">
                  {days.map((day) => {
                    const isDone = completedDays.includes(day.day);
                    return (
                      <div 
                        key={day.day}
                        className={cn(
                          "group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                          isDone ? "bg-background border-green-200" : "bg-background/80 border-border hover:border-primary/30"
                        )}
                        onClick={() => toggleDay(day.day)}
                      >
                        <div className="mt-1">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/50 transition-colors" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black uppercase text-primary/60">Day {day.day}</span>
                            <h5 className={cn("font-bold text-sm truncate", isDone && "text-muted-foreground line-through")}>{day.title}</h5>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                            {day.task}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground italic">
                              “{day.mindset}”
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {completedDays.length === 30 && (
          <div className="mt-8 p-6 text-center bg-gradient-to-br from-gold/20 to-accent/10 rounded-3xl border border-gold/30 animate-bounce-in">
             <Trophy className="w-12 h-12 text-gold mx-auto mb-4" />
             <h3 className="text-2xl font-black text-foreground mb-2">Challenge Graduated!</h3>
             <p className="text-muted-foreground mb-6">You've moved from chaos to structure. Your badge is now active.</p>
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-full font-bold shadow-lg shadow-accent/20">
                <Star className="w-4 h-4" />
                🟢 Structured Seller
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
