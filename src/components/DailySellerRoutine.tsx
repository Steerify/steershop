import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, Clock, Instagram, MessageSquare, Send, Calendar, Sun, Sunrise, Sunset, Share2, PlusCircle, Image as ImageIcon, DollarSign, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoutineStep {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
}

const steps: RoutineStep[] = [
  { id: 'step1', title: 'Set Up', icon: Clock, description: '10 min foundation' },
  { id: 'step2', title: 'One Link Habit', icon: Share2, description: 'Install your system' },
  { id: 'step3', title: 'Daily Workflow', icon: Sun, description: 'Sales ritual' },
  { id: 'step4', title: 'Weekly Reset', icon: Calendar, description: 'Sunday prep' },
];

export const DailySellerRoutine = () => {
  const [activeTab, setActiveTab] = useState('step1');

  return (
    <Card className="w-full border-none shadow-xl bg-gradient-to-br from-card to-secondary/30 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-accent/20 text-accent">
            <Sunrise className="w-5 h-5" />
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold">The SteerSolo Daily Seller Routine</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground font-medium">
          Turn manual selling into a structured, professional system.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl mb-6">
            {steps.map((step) => (
              <TabsTrigger 
                key={step.id} 
                value={step.id}
                className={cn(
                  "flex flex-col gap-1 py-3 rounded-lg transition-all duration-300 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary",
                  "text-[10px] md:text-sm"
                )}
              >
                <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden xs:inline">{step.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="step1" className="animate-fade-in focus-visible:outline-none">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                  Step 1: Set Up Your Store <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">(10 mins)</span>
                </h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Add products', icon: PlusCircle },
                  { label: 'Add pricing', icon: DollarSign },
                  { label: 'Add images', icon: ImageIcon },
                  { label: 'Generate your link', icon: LinkIcon },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">{item.label}</span>
                    <Circle className="ml-auto w-5 h-5 text-muted-foreground/30" />
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-200/50 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-bold text-emerald-700">“Your daily selling system is now live.”</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="step2" className="animate-fade-in focus-visible:outline-none">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary">Step 2: Install Your One Link Habit Checklist</h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Add to Instagram bio', icon: Instagram, color: 'text-pink-600' },
                  { label: 'Pin on WhatsApp', icon: MessageSquare, color: 'text-green-600' },
                  { label: 'Save as quick reply', icon: Send, color: 'text-blue-500' },
                  { label: 'Add to broadcast message', icon: Share2, color: 'text-orange-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all">
                    <div className={cn("w-10 h-10 rounded-full bg-muted flex items-center justify-center", item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">{item.label}</span>
                    <Circle className="ml-auto w-5 h-5 text-muted-foreground/30" />
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-bold text-primary italic">“From today, you don’t explain prices. You send your link.”</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="step3" className="animate-fade-in focus-visible:outline-none">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary">Step 3: Daily Sales Workflow</h3>
              
              <div className="space-y-4">
                {[
                  { 
                    time: 'Morning', 
                    icon: Sunrise, 
                    color: 'text-amber-500', 
                    tasks: ['Check new orders', 'Confirm payments', 'Respond to WhatsApp orders'] 
                  },
                  { 
                    time: 'Midday', 
                    icon: Sun, 
                    color: 'text-orange-500', 
                    tasks: ['Share store link in stories', 'Post one product'] 
                  },
                  { 
                    time: 'Evening', 
                    icon: Sunset, 
                    color: 'text-indigo-500', 
                    tasks: ['Review orders', 'Update stock'] 
                  },
                ].map((period, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-background border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <period.icon className={cn("w-5 h-5", period.color)} />
                      <span className="font-bold text-foreground">{period.time}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {period.tasks.map((task, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                          <Circle className="w-2 h-2 fill-primary/20 text-primary" />
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <div className="flex gap-4 text-xs font-bold text-accent uppercase tracking-widest">
                  <span>Simple</span>
                  <span>•</span>
                  <span>Repeatable</span>
                  <span>•</span>
                  <span>Calm</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="step4" className="animate-fade-in focus-visible:outline-none">
            <div className="space-y-6">
              <div className="text-center p-6 bg-primary/5 rounded-3xl border border-dashed border-primary/30">
                <Calendar className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">Weekly Reset (Sunday Reminder)</h3>
                <p className="text-muted-foreground text-sm italic mb-6">“Is your store ready for this week?”</p>
                
                <div className="max-w-md mx-auto grid gap-3">
                   {[
                    'Update featured products',
                    'Check stock levels',
                    'Share link again publicly'
                  ].map((task, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/50 text-left">
                      <span className="font-semibold text-sm">{task}</span>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                        <PlusCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <p className="mt-8 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Now SteerSolo becomes a ritual.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
