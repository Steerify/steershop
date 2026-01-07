import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMarketingAccess } from "@/hooks/useMarketingAccess";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CanvasEditor } from "@/components/marketing/CanvasEditor";
import { AIAssistant } from "@/components/marketing/AIAssistant";
import { ArrowLeft, Loader2, Save, Sparkles, X } from "lucide-react";

const PosterEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template");
  const { user } = useAuth();
  const { toast } = useToast();
  const access = useMarketingAccess();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [posterName, setPosterName] = useState("Untitled Poster");
  const [canvasData, setCanvasData] = useState<any>(null);
  const [shopData, setShopData] = useState<{ id: string; name: string } | null>(null);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (user) {
      fetchShopData();
      loadPosterData();
    }
  }, [user, id, templateId]);

  const fetchShopData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("shops")
      .select("id, shop_name")
      .eq("owner_id", user.id)
      .single();

    if (data) {
      setShopData({ id: data.id, name: data.shop_name });
    }
  };

  const loadPosterData = async () => {
    setIsLoading(true);
    try {
      if (id) {
        // Load existing poster
        const { data, error } = await supabase
          .from("user_posters")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) {
          setPosterName(data.name);
          setCanvasData(data.canvas_data);
        }
      } else if (templateId) {
        // Load template
        const { data, error } = await supabase
          .from("poster_templates")
          .select("*")
          .eq("id", templateId)
          .single();

        if (error) throw error;
        if (data) {
          setPosterName(`${data.name} - Copy`);
          setCanvasData(data.template_data);
        }
      }
    } catch (error) {
      console.error("Error loading poster:", error);
      toast({
        title: "Error loading poster",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    if (!user || !shopData) {
      toast({
        title: "Cannot save",
        description: "Please ensure you're logged in and have a shop",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (id) {
        // Update existing poster
        const { error } = await supabase
          .from("user_posters")
          .update({
            name: posterName,
            canvas_data: data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;
      } else {
        // Create new poster
        const { error } = await supabase.from("user_posters").insert({
          user_id: user.id,
          shop_id: shopData.id,
          name: posterName,
          canvas_data: data,
        });

        if (error) throw error;
      }

      toast({
        title: "Poster saved!",
        description: "Your poster has been saved successfully",
      });

      navigate("/marketing");
    } catch (error: any) {
      console.error("Error saving poster:", error);
      toast({
        title: "Failed to save",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInsertText = (text: string) => {
    // This would be connected to the canvas editor to insert AI-generated text
    toast({
      title: "Text copied",
      description: "Paste it into your canvas using the text tool",
    });
  };

  if (access.isLoading || isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (!access.canAccess) {
    navigate("/marketing");
    return null;
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => navigate("/marketing")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Input
                value={posterName}
                onChange={(e) => setPosterName(e.target.value)}
                className="max-w-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAI(!showAI)}
                className={showAI ? "bg-primary/10" : ""}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">AI</span>
              </Button>
              <Button size="sm" disabled={isSaving} onClick={() => handleSave(canvasData)}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="container mx-auto px-4 py-4 h-[calc(100vh-65px)]">
        <div className="flex gap-4 h-full">
          {/* Main Editor */}
          <div className="flex-1 min-w-0">
            <CanvasEditor
              initialData={canvasData}
              onSave={handleSave}
              shopName={shopData?.name || "My Shop"}
            />
          </div>

          {/* AI Sidebar */}
          {showAI && (
            <div className="w-80 hidden lg:block">
              <div className="relative h-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -left-2 top-2 z-10"
                  onClick={() => setShowAI(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <AIAssistant
                  shopName={shopData?.name || "My Shop"}
                  onInsertText={handleInsertText}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default PosterEditor;
