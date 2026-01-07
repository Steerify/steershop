import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Loader2, Sparkles, Lock, TrendingUp } from "lucide-react";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { ShopReactions } from "@/components/ShopReactions";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UpgradePrompt } from "@/components/UpgradePrompt";

interface StrokeMyShopProps {
  shopId: string;
  shopName: string;
}

export const StrokeMyShop = ({ shopId, shopName }: StrokeMyShopProps) => {
  const { toast } = useToast();
  const { checkFeatureAccess, isChecking } = useSubscriptionLimits();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{
    can_use: boolean;
    blocked_by_plan: boolean;
    current_usage: number;
    max_usage: number;
    is_business: boolean;
    plan_slug: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsageInfo();
    }
  }, [isOpen]);

  const loadUsageInfo = async () => {
    const usage = await checkFeatureAccess("stroke_my_shop");
    setUsageInfo(usage);
    
    // If blocked by plan (Basic users), show upgrade prompt
    if (usage?.blocked_by_plan) {
      setShowUpgradePrompt(true);
    }
  };

  const handleTriggerClick = async () => {
    // First check if user's plan allows AI features
    const usage = await checkFeatureAccess("stroke_my_shop");
    setUsageInfo(usage);
    
    if (usage?.blocked_by_plan) {
      // Show upgrade prompt instead of opening dialog
      setShowUpgradePrompt(true);
      return;
    }
    
    setIsOpen(true);
    if (!response) {
      handleStroke();
    }
  };

  const handleStroke = async () => {
    // Check usage first
    if (usageInfo && !usageInfo.can_use) {
      if (usageInfo.blocked_by_plan) {
        setShowUpgradePrompt(true);
        return;
      }
      toast({
        title: "Monthly Limit Reached",
        description: "Upgrade to Business for unlimited roasts!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Please Log In",
          description: "You need to be logged in to use this feature.",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stroke-my-shop`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ shop_id: shopId }),
        }
      );

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Slow down! Too many requests. Try again in a minute.');
        }
        if (res.status === 402) {
          throw new Error('AI credits exhausted. Please contact support.');
        }
        if (res.status === 403) {
          const errorData = await res.json();
          if (errorData.blocked_by_plan) {
            setUsageInfo(prev => prev ? { ...prev, blocked_by_plan: true, can_use: false } : null);
            setShowUpgradePrompt(true);
            return;
          }
          if (errorData.limit_reached) {
            setUsageInfo(prev => prev ? { ...prev, can_use: false } : null);
            throw new Error('Monthly limit reached. Upgrade to Business for unlimited roasts!');
          }
          throw new Error(errorData.error || 'Access denied');
        }
        throw new Error('Failed to get AI response');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  setResponse(fullResponse);
                }
              } catch {
                // Skip invalid JSON chunks
              }
            }
          }
        }
      }

      // Reload usage info after successful roast
      await loadUsageInfo();
    } catch (error: any) {
      console.error('Stroke My Shop error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze your shop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const usagePercentage = usageInfo 
    ? usageInfo.max_usage === -1 
      ? 0 
      : usageInfo.max_usage > 0 
        ? (usageInfo.current_usage / usageInfo.max_usage) * 100
        : 100
    : 0;

  return (
    <>
      {/* Upgrade Prompt for Basic Users */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="ai"
        currentPlan={usageInfo?.plan_slug || "basic"}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700"
            onClick={(e) => {
              e.preventDefault();
              handleTriggerClick();
            }}
          >
            <Flame className="w-4 h-4 mr-2" />
            Stroke My Shop
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl max-h-[85vh] mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              Stroke My Shop AI
            </DialogTitle>
            <DialogDescription>
              Get honest (and funny) feedback about {shopName} from your AI business friend
            </DialogDescription>
          </DialogHeader>

          {/* Usage Info Banner - Only show for Pro users (not Basic, not Business) */}
          {usageInfo && !usageInfo.is_business && !usageInfo.blocked_by_plan && usageInfo.max_usage > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Monthly Usage: {usageInfo.current_usage}/{usageInfo.max_usage}
                </span>
                {usageInfo.current_usage >= usageInfo.max_usage ? (
                  <Badge variant="destructive" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Limit Reached
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {usageInfo.max_usage - usageInfo.current_usage} left
                  </Badge>
                )}
              </div>
              <Progress value={usagePercentage} className="h-1.5" />
              {usageInfo.current_usage >= usageInfo.max_usage && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    Upgrade for unlimited roasts!
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => setShowUpgradePrompt(true)}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Upgrade
                  </Button>
                </div>
              )}
            </div>
          )}

          {usageInfo?.is_business && (
            <Badge className="w-fit bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Business: Unlimited Roasts
            </Badge>
          )}

          <ScrollArea className="h-[50vh] pr-4">
            {isLoading && !response ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                <p className="text-muted-foreground animate-pulse">
                  Analyzing your shop... Preparing roast... 🔥
                </p>
              </div>
            ) : response ? (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {response}
                </div>
                {isLoading && (
                  <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1" />
                )}
              </div>
            ) : usageInfo && !usageInfo.can_use && !usageInfo.blocked_by_plan ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">Monthly Limit Reached</p>
                <p className="text-muted-foreground text-center mb-4">
                  You've used all {usageInfo.max_usage} roasts this month. Upgrade to Business for unlimited access!
                </p>
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  onClick={() => setShowUpgradePrompt(true)}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Sparkles className="w-12 h-12 text-orange-500 mb-4" />
                <p className="text-muted-foreground">
                  Click the button to get your shop roasted!
                </p>
              </div>
            )}
          </ScrollArea>

          {/* Reactions Section */}
          {response && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">How was this roast?</p>
              <ShopReactions shopId={shopId} />
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Powered by AI • Take suggestions with a grain of salt (and humor)
            </p>
            <Button 
              variant="outline" 
              onClick={handleStroke}
              disabled={isLoading || (usageInfo ? !usageInfo.can_use : false)}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Flame className="w-4 h-4 mr-2" />
              )}
              {response ? "Roast Again" : "Get Roasted"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
