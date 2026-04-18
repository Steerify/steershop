import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Sparkles, X, Check, ImagePlus, Edit } from "lucide-react";
import { uploadService } from "@/services/upload.service";
import productService from "@/services/product.service";

interface DraftProduct {
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
}

interface BulkProductUploadProps {
  open: boolean;
  onClose: () => void;
  shopId: string;
  onSuccess: () => void;
}

export const BulkProductUpload = ({ open, onClose, shopId, onSuccess }: BulkProductUploadProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [step, setStep] = useState<"upload" | "review">("upload");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 10 - files.length);
    const newFiles = [...files, ...selected].slice(0, 10);
    setFiles(newFiles);

    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Upload all images first
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const result = await uploadService.uploadImage(file, "product-images");
        uploadedUrls.push(result.url);
      }

      setIsUploading(false);
      setIsAnalyzing(true);

      // Call AI edge function
      const { data, error } = await supabase.functions.invoke("ai-bulk-product-create", {
        body: { image_urls: uploadedUrls },
      });

      if (error) throw error;

      if (data?.products && Array.isArray(data.products)) {
        setDrafts(
          data.products.map((p: any, i: number) => ({
            name: p.name || `Product ${i + 1}`,
            description: p.description || "",
            category: p.category || "general",
            price: p.price || 0,
            image_url: uploadedUrls[i] || "",
          }))
        );
        setStep("review");
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not analyze images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const updateDraft = (index: number, field: keyof DraftProduct, value: string | number) => {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  const removeDraft = (index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmAll = async () => {
    if (drafts.length === 0) return;
    setIsSaving(true);

    try {
      for (const draft of drafts) {
        await productService.createProduct({
          shopId: shopId,
          name: draft.name,
          description: draft.description,
          price: draft.price,
          images: draft.image_url ? [{ url: draft.image_url, alt: draft.name }] : [],
          inventory: 10,
          is_available: true,
          type: "product",
        } as any);
      }

      toast({
        title: `${drafts.length} Products Created! 🎉`,
        description: "All products have been added to your catalog.",
      });
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast({
        title: "Error Creating Products",
        description: error.message || "Some products could not be created.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setPreviews([]);
    setDrafts([]);
    setStep("upload");
    setEditingIndex(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Bulk Product Upload
          </DialogTitle>
          <DialogDescription>
            {step === "upload"
              ? "Upload up to 10 product images. AI will auto-generate names, descriptions, and prices."
              : "Review and edit the AI-generated product details, then confirm to create all."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="bulk-upload-input"
                disabled={files.length >= 10}
              />
              <label htmlFor="bulk-upload-input" className="cursor-pointer">
                <ImagePlus className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to select images</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {files.length}/10 images selected
                </p>
              </label>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={handleAnalyze}
                disabled={files.length === 0 || isUploading || isAnalyzing}
              >
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                ) : isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI Analyzing...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Analyze with AI</>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <img
                      src={draft.image_url}
                      alt={draft.name}
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      {editingIndex === i ? (
                        <div className="space-y-2">
                          <Input
                            value={draft.name}
                            onChange={(e) => updateDraft(i, "name", e.target.value)}
                            placeholder="Product name"
                            className="h-8 text-sm"
                          />
                          <Textarea
                            value={draft.description}
                            onChange={(e) => updateDraft(i, "description", e.target.value)}
                            placeholder="Description"
                            rows={2}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={draft.price}
                              onChange={(e) => {
                                const parsedPrice = Number(e.target.value);
                                updateDraft(i, "price", Number.isFinite(parsedPrice) && Number.isInteger(parsedPrice) && parsedPrice > 0 ? parsedPrice : 0);
                              }}
                              placeholder="Price"
                              className="h-8 text-sm w-28"
                            />
                            <Input
                              value={draft.category}
                              onChange={(e) => updateDraft(i, "category", e.target.value)}
                              placeholder="Category"
                              className="h-8 text-sm"
                            />
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                            <Check className="w-3 h-3 mr-1" /> Done
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{draft.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{draft.description}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingIndex(i)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeDraft(i)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">₦{draft.price.toLocaleString()}</Badge>
                            <Badge variant="secondary" className="text-xs">{draft.category}</Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setStep("upload"); setDrafts([]); }}>
                Back
              </Button>
              <Button onClick={handleConfirmAll} disabled={isSaving || drafts.length === 0}>
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                ) : (
                  <><Check className="w-4 h-4 mr-2" />Create {drafts.length} Products</>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
