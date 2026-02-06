import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMarketingAccess } from "@/hooks/useMarketingAccess";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CanvasEditor, exportCanvasToBlob } from "@/components/marketing/CanvasEditor";
import type { CanvasElement, CanvasSize } from "@/components/marketing/CanvasEditor";
import { AIAssistant } from "@/components/marketing/AIAssistant";
import { transformTemplateData, getDefaultStarterContent } from "@/utils/transformTemplateData";
import {
  ArrowLeft, Loader2, Save, Sparkles, X, Download,
  Share2, Undo, Redo
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const formatUUID = (id: string) => {
  if (!id) return id;
  const clean = id.replace(/-/g, '');
  if (clean.length === 32 && /^[a-f0-9]{32}$/i.test(clean)) {
    return `${clean.slice(0,8)}-${clean.slice(8,12)}-${clean.slice(12,16)}-${clean.slice(16,20)}-${clean.slice(20)}`;
  }
  return id;
};

interface CanvasData {
  elements: CanvasElement[];
  background: string;
  canvasSize?: CanvasSize;
}

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
  const [isExporting, setIsExporting] = useState(false);
  const [posterName, setPosterName] = useState("Untitled Poster");
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [shopData, setShopData] = useState<any>(null);
  const [showAI, setShowAI] = useState(false);
  const [history, setHistory] = useState<CanvasData[]>([]);
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
      const shopName = shopData?.shop_name || "My Shop";

      if (formattedPosterId) {
        const { data } = await supabase.from("user_posters").select("*").eq("id", formattedPosterId).single();
        if (data) {
          setPosterName(data.name);
          const transformed = transformTemplateData(data.canvas_data, shopName);
          setCanvasData(transformed);
          setHistory([transformed]);
          setHistoryIndex(0);
        }
      } else if (formattedTemplateId) {
        const { data } = await supabase.from("poster_templates").select("*").eq("id", formattedTemplateId).single();
        if (data) {
          setPosterName(`${data.name} - Copy`);
          const transformed = transformTemplateData(data.template_data, shopName);
          setCanvasData(transformed);
          setHistory([transformed]);
          setHistoryIndex(0);
        }
      } else {
        // New poster — use default starter content
        const starter = getDefaultStarterContent(shopName);
        setCanvasData(starter);
        setHistory([starter]);
        setHistoryIndex(0);
      }
    } catch {
      toast({ title: "Failed to load", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Re-load when shopData arrives (for template name substitution)
  useEffect(() => {
    if (shopData && !formattedPosterId && !formattedTemplateId && canvasData) {
      const starter = getDefaultStarterContent(shopData.shop_name || "My Shop");
      setCanvasData(starter);
    }
  }, [shopData]);

  const pushToHistory = useCallback((newData: CanvasData) => {
    setCanvasData(newData);
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newData);
      return newHistory.slice(-20);
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

  const handleSave = async (data: CanvasData) => {
    if (!user || !shopData) return;
    setIsSaving(true);
    try {
      const canvasJson = JSON.parse(JSON.stringify(data));

      if (formattedPosterId) {
        await supabase.from("user_posters").update({
          name: posterName,
          canvas_data: canvasJson,
          thumbnail_url: null,
          updated_at: new Date().toISOString(),
        }).eq("id", formattedPosterId);
      } else {
        await (supabase.from("user_posters").insert as any)({
          user_id: formatUUID(user.id),
          shop_id: formatUUID(shopData.id),
          name: posterName,
          canvas_data: canvasJson,
          thumbnail_url: null,
          updated_at: new Date().toISOString(),
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

  const getExportData = (): { elements: CanvasElement[]; background: string; canvasSize: CanvasSize } | null => {
    if (!canvasData) return null;
    return {
      elements: canvasData.elements || [],
      background: canvasData.background || "#ffffff",
      canvasSize: canvasData.canvasSize || { width: 1080, height: 1080, label: "Instagram Post" },
    };
  };

  const handleExport = async (format: "png" | "jpg") => {
    const data = getExportData();
    if (!data) return;
    setIsExporting(true);
    try {
      const blob = await exportCanvasToBlob(data.elements, data.background, data.canvasSize, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${posterName.replace(/[^a-zA-Z0-9]/g, "_")}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: `Downloaded as ${format.toUpperCase()}!` });
    } catch (err) {
      toast({ title: "Export failed", description: "Could not generate image", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const data = getExportData();
    if (!data) return;
    setIsExporting(true);
    try {
      const blob = await exportCanvasToBlob(data.elements, data.background, data.canvasSize, "png");
      const file = new File([blob], `${posterName}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: posterName,
          text: `Check out this poster from ${shopData?.shop_name || "my shop"}!`,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${posterName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my latest promotion from ${shopData?.shop_name || "my shop"}! 🎉`)}`,
          "_blank"
        );
        toast({ title: "Image downloaded!", description: "Attach it to your WhatsApp message" });
      }
    } catch {
      toast({ title: "Share failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
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
        <div className="container mx-auto px-2 sm:px-4 h-14 flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/marketing")} className="shrink-0">
              <ArrowLeft />
            </Button>
            <Input
              value={posterName}
              onChange={e => setPosterName(e.target.value)}
              className="font-medium w-28 sm:w-80"
            />
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0} className="h-8 w-8 p-0 sm:w-auto sm:px-3">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="h-8 w-8 p-0 sm:w-auto sm:px-3">
              <Redo className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowAI(!showAI)} className="h-8">
              <Sparkles className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">AI</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handleShare} disabled={isExporting || !canvasData} className="h-8">
              <Share2 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={isExporting || !canvasData} className="h-8">
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 sm:mr-1" />}
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("png")}>Download PNG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("jpg")}>Download JPG</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" onClick={() => canvasData && handleSave(canvasData)} disabled={isSaving} className="h-8">
              {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4 sm:mr-1" />}
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area - responsive */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)]">
        <div className="flex-1 relative p-2 sm:p-4">
          <CanvasEditor
            initialData={canvasData || undefined}
            onChange={pushToHistory}
            onSave={handleSave}
            shopName={shopData?.shop_name || "My Shop"}
            shopLogo={shopData?.logo_url}
          />
        </div>

        {/* AI Assistant - Sheet on mobile, side panel on desktop */}
        <div className="hidden lg:block">
          {showAI && (
            <div className="w-80 xl:w-96 border-l bg-card relative h-[calc(100vh-56px)] overflow-y-auto">
              <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10" onClick={() => setShowAI(false)}>
                <X className="w-4 h-4" />
              </Button>
              <AIAssistant shopName={shopData?.shop_name} />
            </div>
          )}
        </div>

        <Sheet open={showAI && typeof window !== 'undefined' && window.innerWidth < 1024} onOpenChange={setShowAI}>
          <SheetContent side="bottom" className="h-[70vh] p-0">
            <SheetHeader className="p-4 pb-2">
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Marketing Assistant
              </SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              <AIAssistant shopName={shopData?.shop_name} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </PageWrapper>
  );
};

export default PosterEditor;
