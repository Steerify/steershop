import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Copy, Loader2, Type, Lightbulb, MessageSquare } from "lucide-react";

interface AIAssistantProps {
  shopName: string;
  onInsertText?: (text: string) => void;
}

export const AIAssistant = ({ shopName, onInsertText }: AIAssistantProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [activeTab, setActiveTab] = useState("headline");

  const presets = {
    headline: [
      "Flash sale announcement",
      "New product launch",
      "Limited time offer",
      "Customer appreciation",
    ],
    copy: [
      "Product description",
      "About the shop",
      "Promotional text",
      "Call to action",
    ],
    concept: [
      "Minimalist poster",
      "Bold and colorful",
      "Professional business",
      "Fun and playful",
    ],
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Enter a prompt",
        description: "Please describe what you want to generate",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to use AI features",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("marketing-ai-assist", {
        body: {
          type: activeTab,
          prompt,
          context: {
            shopName,
          },
        },
      });

      if (response.error) throw response.error;

      if (response.data?.result) {
        setResult(response.data.result);
      } else {
        throw new Error("No result returned");
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast({ title: "Copied to clipboard" });
  };

  const handleInsert = () => {
    if (onInsertText && result) {
      onInsertText(result);
      toast({ title: "Text inserted into canvas" });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="headline" className="text-xs">
              <Type className="w-3 h-3 mr-1" />
              Headlines
            </TabsTrigger>
            <TabsTrigger value="copy" className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              Copy
            </TabsTrigger>
            <TabsTrigger value="concept" className="text-xs">
              <Lightbulb className="w-3 h-3 mr-1" />
              Concepts
            </TabsTrigger>
          </TabsList>

          {Object.entries(presets).map(([key, values]) => (
            <TabsContent key={key} value={key} className="mt-3">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {values.map((preset) => (
                  <Badge
                    key={preset}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                    onClick={() => setPrompt(preset)}
                  >
                    {preset}
                  </Badge>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Textarea
          placeholder={`Describe your ${activeTab}...`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[80px] resize-none"
        />

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </>
          )}
        </Button>

        {result && (
          <div className="flex-1 flex flex-col">
            <div className="bg-muted/50 rounded-lg p-3 flex-1 overflow-auto">
              <p className="text-sm whitespace-pre-wrap">{result}</p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={handleCopy} className="flex-1">
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              {onInsertText && (
                <Button size="sm" onClick={handleInsert} className="flex-1">
                  Insert
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
