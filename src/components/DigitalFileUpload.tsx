import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Check, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadService, type UploadController } from "@/services/upload.service";
import { useToast } from "@/hooks/use-toast";

interface DigitalFileUploadProps {
  value: string;
  onChange: (url: string) => void;
  onFileNameChange?: (name: string) => void;
}

export const DigitalFileUpload = ({
  value,
  onChange,
  onFileNameChange,
}: DigitalFileUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadControllerRef = useRef<UploadController | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCancelUpload = () => {
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
    }
    setIsUploading(false);
    setFileName("");
    setFileSize("");
    setUploadProgress(0);
  };

  const processFile = async (file: File) => {
    // 25MB max size validation
    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast({
        title: "File Too Large",
        description: "The digital deliverable must be under 25MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setFileName(file.name);
    setFileSize(formatBytes(file.size));

    try {
      // Create an upload controller for cancellation
      const controller: UploadController = { abort: () => {} };
      uploadControllerRef.current = controller;
      
      const res = await uploadService.uploadFile(file, 'digital-products', (progress) => {
        setUploadProgress(progress);
      }, controller);
      
      onChange(res.url);
      if (onFileNameChange) {
        onFileNameChange(file.name);
      }

      toast({
        title: "Upload Successful! ⚡",
        description: `${file.name} is uploaded and secured.`,
      });
    } catch (error: any) {
      if (error?.message?.includes('cancelled')) {
        toast({
          title: "Upload Cancelled",
          description: "You cancelled the file upload.",
        });
      } else {
        console.error("Digital file upload failed:", error);
        toast({
          title: "Upload Failed",
          description: error.message || "Something went wrong uploading your file.",
          variant: "destructive",
        });
      }
      setFileName("");
      setFileSize("");
    } finally {
      setIsUploading(false);
      uploadControllerRef.current = null;
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleClear = () => {
    if (isUploading) {
      handleCancelUpload();
    }
    onChange("");
    setFileName("");
    setFileSize("");
    setUploadProgress(0);
    if (onFileNameChange) {
      onFileNameChange("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,.zip,.epub,.docx,.doc,.txt,.png,.jpg,.jpeg"
        className="hidden"
      />

      {!value && !isUploading ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/5"
              : "border-primary/20 hover:border-primary/40 bg-background/50 hover:bg-background"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground mb-1">
            Drag & drop your digital file here
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            or click to browse from your device
          </p>
          <div className="flex flex-wrap gap-2 justify-center max-w-sm">
            <span className="px-2.5 py-1 rounded-full bg-muted/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              PDF
            </span>
            <span className="px-2.5 py-1 rounded-full bg-muted/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              ZIP
            </span>
            <span className="px-2.5 py-1 rounded-full bg-muted/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              EPUB
            </span>
            <span className="px-2.5 py-1 rounded-full bg-muted/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              DOCX
            </span>
            <span className="px-2.5 py-1 rounded-full bg-muted/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Max 25MB
            </span>
          </div>
        </div>
      ) : isUploading ? (
        <div className="border border-border/80 rounded-2xl p-6 bg-background/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{fileName || "Uploading deliverable..."}</p>
              <p className="text-xs text-muted-foreground">{fileSize || "Calculating..."}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancelUpload}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full h-8 w-8 shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>Uploading to secure vault...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 bg-muted rounded-full" />
          </div>
          <p className="text-xs text-muted-foreground">
            You can cancel the upload at any time
          </p>
        </div>
      ) : (
        <div className="border border-green-500/20 bg-green-500/5 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-green-700 dark:text-green-400 truncate">
                {fileName || "Secure File Uploaded"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] bg-green-500/10 text-green-600 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                  <Check className="w-3.5 h-3.5" /> SECURE
                </span>
                <span className="text-xs text-muted-foreground truncate">{fileSize || "Access verified"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(value, "_blank")}
              className="h-9 border-green-500/20 text-green-600 hover:bg-green-500/10 text-xs font-bold rounded-xl"
            >
              Verify Link
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleClear}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
