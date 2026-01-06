import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Loader2, Sparkles } from "lucide-react";

interface StrokeMyShopProps {
  shopId: string;
  shopName: string;
}

export const StrokeMyShop = ({ shopId, shopName }: StrokeMyShopProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleStroke = async () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700"
          onClick={() => {
            setIsOpen(true);
            if (!response) {
              handleStroke();
            }
          }}
        >
          <Flame className="w-4 h-4 mr-2" />
          Stroke My Shop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Sparkles className="w-12 h-12 text-orange-500 mb-4" />
              <p className="text-muted-foreground">
                Click the button to get your shop roasted!
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Powered by AI • Take suggestions with a grain of salt (and humor)
          </p>
          <Button 
            variant="outline" 
            onClick={handleStroke}
            disabled={isLoading}
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
  );
};
