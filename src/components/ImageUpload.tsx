// src/components/ImageUpload.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from './ui/alert';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  autoUpload?: boolean;
  onFileSelect?: (file: File | null) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label,
  className = '',
  autoUpload = true,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress, error: uploadError, reset } = useFileUpload();
  const [localError, setLocalError] = useState<string | null>(null);
  const { user } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayUrl = value || previewUrl;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLocalError(null);
    if (file) {
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
        const url = await upload(file, user?.id);
        if (url) {
          onChange(url);
          // Only clear preview if upload succeeded and we have a new remote URL
          setPreviewUrl(null); 
        }
      } else {
        // Manual mode: just notify parent about the file selection
        if (onFileSelect) {
          onFileSelect(file);
        }
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    if (onFileSelect) {
      onFileSelect(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreviewUrl(null);
    setLocalError(null);
    reset();
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      
      <div 
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 ${
          isUploading ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />

        {displayUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg group">
            <img 
              src={displayUrl} 
              alt="Uploaded" 
              className={`w-full h-full object-cover ${isUploading ? 'opacity-50' : ''}`}
            />
            
            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-sm z-10 transition-all">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                <div className="w-3/4 max-w-[200px] space-y-1">
                  <Progress value={progress} className="h-1" />
                  <p className="text-xs text-center text-foreground font-medium drop-shadow-sm">{progress}% uploaded</p>
                </div>
              </div>
            )}

            {!isUploading && (
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
          <div 
            className="flex flex-col items-center justify-center py-6 cursor-pointer space-y-2"
            onClick={triggerUpload}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-4 w-full px-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div className="w-full space-y-1">
                  <Progress value={progress} className="h-1" />
                  <p className="text-xs text-center text-muted-foreground">{progress}% uploaded</p>
                </div>
              </div>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload image</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WebP (max. 5MB)</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {(uploadError || localError) && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{uploadError || localError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
