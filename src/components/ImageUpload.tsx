// src/components/ImageUpload.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, Loader2, Camera } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Alert, AlertDescription } from './ui/alert';
import { uploadService } from '@/services/upload.service';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  autoUpload?: boolean;
  onFileSelect?: (file: File | null) => void;
  folder?: 'shop-images' | 'product-images';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label,
  className = '',
  autoUpload = true,
  onFileSelect,
  folder = 'product-images',
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress, error: uploadError, reset, setProgress } = useFileUpload();
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayUrl = value || previewUrl;

  const processAndUpload = async (file: File) => {
    setLocalError(null);
    setCompressionInfo(null);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Invalid file type. Please upload JPG, PNG, or WebP.');
      return;
    }

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (autoUpload) {
      let processedFile = file;
      const originalSize = file.size;

      // Compress if file is larger than 500KB
      if (file.size > 500 * 1024) {
        try {
          setIsCompressing(true);
          setProgress?.(5);
          processedFile = await uploadService.compressImage(file, 1920, 0.8);
          const savedBytes = originalSize - processedFile.size;
          const savedPercent = Math.round((savedBytes / originalSize) * 100);
          setCompressionInfo(
            `Compressed: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(processedFile.size / 1024).toFixed(0)}KB (${savedPercent}% smaller)`
          );
          setProgress?.(15);
        } catch (error) {
          console.warn('Compression failed, using original file:', error);
        } finally {
          setIsCompressing(false);
        }
      }

      const url = await upload(processedFile, folder);
      if (url) {
        onChange(url);
        setPreviewUrl(null);
      }
    } else {
      // Manual mode: just notify parent about the file selection
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndUpload(file);
    }
    // Reset input value so the same file can be selected again
    e.target.value = '';
  };

  const handleRemove = () => {
    onChange('');
    if (onFileSelect) {
      onFileSelect(null);
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
    setPreviewUrl(null);
    setLocalError(null);
    setCompressionInfo(null);
    reset();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const triggerGallery = () => {
    galleryInputRef.current?.click();
  };

  const isProcessing = isUploading || isCompressing;
  const statusText = isCompressing ? 'Compressing...' : `${progress}% uploaded`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      
      <div 
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 ${
          isProcessing ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'
        }`}
      >
        {/* Camera input - opens device camera directly */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={isProcessing}
        />

        {/* Gallery input - opens file picker */}
        <input
          type="file"
          ref={galleryInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isProcessing}
        />

        {displayUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg group">
            <img 
              src={displayUrl} 
              alt="Uploaded" 
              className={`w-full h-full object-cover ${isProcessing ? 'opacity-50' : ''}`}
            />
            
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-sm z-10 transition-all">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                <div className="w-3/4 max-w-[200px] space-y-1">
                  <Progress value={progress} className="h-1" />
                  <p className="text-xs text-center text-foreground font-medium drop-shadow-sm">{statusText}</p>
                </div>
              </div>
            )}

            {!isProcessing && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemove}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-4 w-full px-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div className="w-full space-y-1">
                  <Progress value={progress} className="h-1" />
                  <p className="text-xs text-center text-muted-foreground">{statusText}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium mb-1">Upload product image</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WebP (max. 5MB)</p>
                </div>
                
                {/* Dual buttons for camera and gallery */}
                <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerCamera}
                    className="min-h-[44px] flex-1 min-w-[120px] max-w-[160px]"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerGallery}
                    className="min-h-[44px] flex-1 min-w-[120px] max-w-[160px]"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Compression info */}
      {compressionInfo && (
        <p className="text-xs text-green-600 dark:text-green-400">{compressionInfo}</p>
      )}

      {(uploadError || localError) && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{uploadError || localError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
