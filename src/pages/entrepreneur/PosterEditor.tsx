import { useState, useEffect, useCallback } from "react";
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
import { 
  ArrowLeft, Loader2, Save, Sparkles, X, Download, 
  FileImage, FileText, Layers, Undo, Redo, ZoomIn, ZoomOut 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper to format UUID
const formatUUID = (id: string) => {
  if (!id) return id;
  const clean = id.replace(/-/g, '');
  if (clean.length === 32 && /^[a-f0-9]{32}$/i.test(clean)) {
    return `${clean.slice(0,8)}-${clean.slice(8,12)}-${clean.slice(12,16)}-${clean.slice(16,20)}-${clean.slice(20)}`;
  }
  return id;
};

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
  const [shopData, setShopData] = useState<any>(null);
  const [showAI, setShowAI] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const formattedPosterId = id ? formatUUID(id) : null;
  const formattedTemplateId = templateId ? formatUUID(templateId) : null;

  useEffect(() => {
    if (user) {
      fetchShopData();
      loadPosterData();
    }
  }, [user, formattedPosterId, formattedTemplateId]);

  const fetchShopData = async () => {
    const { data } = await supabase
      .from("shops")
      .select("id, shop_name, logo_url")
      .eq("owner_id", formatUUID(user!.id))
      .single();

    if (data) setShopData(data);
  };

  const loadPosterData = async () => {
    setIsLoading(true);
    try {
      if (formattedPosterId) {
        const { data } = await supabase
          .from("user_posters")
          .select("*")
          .eq("id", formattedPosterId)
          .single();

        if (data) {
          setPosterName(data.name);
          setCanvasData(data.canvas_data);
          setHistory([data.canvas_data]);
          setHistoryIndex(0);
        }
      } else if (formattedTemplateId) {
        const { data } = await supabase
          .from("poster_templates")
          .select("*")
          .eq("id", formattedTemplateId)
          .single();

        if (data) {
          setPosterName(`${data.name} - Copy`);
          setCanvasData(data.template_data);
          setHistory([data.template_data]);
          setHistoryIndex(0);
        }
      }
    } catch (err) {
      toast({ title: "Failed to load", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const pushToHistory = useCallback((newData: any) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newData);
      return newHistory.slice(-20); // limit history
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1);
      setCanvasData(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(i => i + 1);
      setCanvasData(history[historyIndex + 1]);
    }
  };

  const handleSave = async (data: any) => {
    if (!user || !shopData) return;
    setIsSaving(true);

    try {
      const payload = {
        name: posterName,
        canvas_data: data,
        thumbnail_url: await generateThumbnail(data), // implement in CanvasEditor
        updated_at: new Date().toISOString(),
      };

      if (formattedPosterId) {
        await supabase.from("user_posters").update(payload).eq("id", formattedPosterId);
      } else {
        await supabase.from("user_posters").insert({
          user_id: formatUUID(user.id),
          shop_id: formatUUID(shopData.id),
          ...payload,
        });
      }

      toast({ title: "Poster saved successfully" });
      navigate("/marketing");
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const generateThumbnail = async (data: any) => {
    // Delegate to CanvasEditor or use html2canvas/dom-to-image (if allowed)
    // Return base64 or uploaded URL
    return null; // placeholder
  };

  const handleExport = async (format: "png" | "jpg" | "pdf") => {
    // Call CanvasEditor.export(format)
    toast({ title: `Exporting as ${format.toUpperCase()}...` });
  };

  if (access.isLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!access.canAccess) {
    navigate("/marketing");
    return null;
  }

  return (
    <PageWrapper>
      {/* Top Toolbar */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/marketing")}>
              <ArrowLeft />
            </Button>
            <Input 
              value={posterName} 
              onChange={e => setPosterName(e.target.value)}
              className="font-medium w-80"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
              <Redo className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowAI(!showAI)}>
              <Sparkles className="w-4 h-4 mr-1" />
              AI
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("png")}>PNG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("jpg")}>JPG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" onClick={() => handleSave(canvasData)} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Canvas Area */}
        <div className="flex-1 relative">
          <CanvasEditor
            initialData={canvasData}
            onChange={pushToHistory}
            onSave={handleSave}
            shopName={shopData?.shop_name || "My Shop"}
            shopLogo={shopData?.logo_url}
          />
        </div>

        {/* AI Sidebar */}
        {showAI && (
          <div className="w-96 border-l bg-card relative">
            <Button variant="ghost" size="icon" className="absolute -left-3 top-4" onClick={() => setShowAI(false)}>
              <X />
            </Button>
            <AIAssistant shopName={shopData?.shop_name} />
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default PosterEditor;