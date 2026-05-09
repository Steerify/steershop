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
import { Loader2, Upload, Sparkles, X, Check, ImagePlus, Edit, ShieldCheck } from "lucide-react";
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
  const [isPaying, setIsPaying] = useState(false);
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [step, setStep] = useState<"upload" | "review">("upload");

  useEffect(() => {
    if (!open) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("bulk_upload") === "verify") {
      const reference = params.get("reference");
      const savedDrafts = localStorage.getItem("bulk_upload_drafts");
      if (reference && savedDrafts) {
        setDrafts(JSON.parse(savedDrafts));
        handleVerifyAndSave(reference);
        window.history.replaceState({}, "", "/dashboard");
      }
    }
  }, [open]);

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

    if (drafts.length > 5) {
      handlePayAndConfirm();
      return;
    }

    await saveProducts();
  };

  const saveProducts = async () => {
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

  const handlePayAndConfirm = async () => {
    setIsPaying(true);
    try {
      // Save drafts to localStorage before redirect
      localStorage.setItem("bulk_upload_drafts", JSON.stringify(drafts));
      localStorage.setItem("bulk_upload_shop_id", shopId);

      const { data, error } = await supabase.functions.invoke("done-for-you-initialize", {
        body: {
          callback_url: `${window.location.origin}/dashboard?bulk_upload=verify`,
        },
      });

      if (error || !data?.authorization_url) {
        throw new Error(data?.error || error?.message || "Failed to initialize payment");
      }

      localStorage.setItem("paystack_bulk_reference", data.reference);
      window.location.href = data.authorization_url;
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "Could not start payment. Please try again.",
        variant: "destructive",
      });
      setIsPaying(false);
    }
  };

  const handleVerifyAndSave = async (reference: string) => {
    setIsSaving(true);
    setStep("review");
    
    try {
      // Verify payment via the setup function (it can verify any reference)
      const { data, error } = await supabase.functions.invoke("done-for-you-setup", {
        body: { reference, business_name: "Verification", whatsapp_number: "000", verify_only: true },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || "Payment verification failed");
      }

      // Record in history
      await supabase.from("subscription_history").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        event_type: "bulk_upload_fee",
        amount: 500000,
        payment_reference: reference,
        notes: `Bulk upload fee for ${drafts.length} products`,
      });

      await saveProducts();
      localStorage.removeItem("bulk_upload_drafts");
      localStorage.removeItem("bulk_upload_shop_id");
      localStorage.removeItem("paystack_bulk_reference");
    } catch (error: any) {
      toast({ title: "Setup Error", description: error.message, variant: "destructive" });
      setStep("upload");
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
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6">
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
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-24 sm:h-20 object-cover rounded-lg border border-border"
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
                  <div className="flex gap-2.5 sm:gap-4">
                    <img
                      src={draft.image_url}
                      alt={draft.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg shrink-0"
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
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/40">₦</span>
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
                                className="h-9 pl-7 text-sm w-full font-bold"
                              />
                            </div>
                            <Input
                              value={draft.category}
                              onChange={(e) => updateDraft(i, "category", e.target.value)}
                              placeholder="Category"
                              className="h-9 text-sm flex-1"
                            />
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)} className="h-9 w-full sm:w-auto">
                            <Check className="w-3.5 h-3.5 mr-1.5" /> Save Changes
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
                          <div className="flex items-center gap-2 pt-1">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/10 transition-all">
                              <span className="text-[10px] font-bold text-primary/60">₦</span>
                              <input
                                type="number"
                                value={draft.price || ""}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? 0 : Number(e.target.value);
                                  updateDraft(i, "price", Math.max(0, Math.floor(val)));
                                }}
                                className="w-20 bg-transparent border-none p-0 text-sm font-bold text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="0"
                              />
                            </div>
                            <Badge variant="secondary" className="text-[10px] px-2 py-0 h-6 uppercase tracking-tight">{draft.category}</Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pricing Warning */}
            <div className="space-y-2 pt-2">
              {drafts.length > 5 ? (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-primary">Bulk Upload Fee Required</p>
                    <p className="text-xs text-muted-foreground">
                      AI bulk setup for 6-10 products is ₦5,000 + ₦175 processing fee.
                    </p>
                    <p className="text-xs font-bold text-foreground">Total: ₦5,175</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-center text-green-600 font-medium">
                  ✨ Free setup for {drafts.length} product{drafts.length > 1 ? 's' : ''}!
                </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setStep("upload"); setDrafts([]); }} disabled={isSaving || isPaying}>
                Back
              </Button>
              <Button onClick={handleConfirmAll} disabled={isSaving || isPaying || drafts.length === 0} className={drafts.length > 5 ? "bg-gradient-to-r from-primary to-accent" : ""}>
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                ) : isPaying ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting...</>
                ) : drafts.length > 5 ? (
                  <><Sparkles className="w-4 h-4 mr-2" /> Pay ₦5,175 & Create</>
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
