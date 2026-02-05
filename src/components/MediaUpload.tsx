// src/components/MediaUpload.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, Loader2, Camera, Video, Image } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Alert, AlertDescription } from './ui/alert';
import { uploadService } from '@/services/upload.service';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface MediaUploadProps {
  imageValue?: string;
  videoValue?: string;
  onImageChange: (url: string) => void;
  onVideoChange: (url: string) => void;
  label?: string;
  className?: string;
  folder?: 'shop-images' | 'product-images';
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  imageValue,
  videoValue,
  onImageChange,
  onVideoChange,
  label,
  className = '',
  folder = 'product-images',
}) => {
  const [mediaType, setMediaType] = useState<'image' | 'video'>(videoValue ? 'video' : 'image');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoCameraRef = useRef<HTMLInputElement>(null);
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

  // Reset media on type change
  useEffect(() => {
    if (mediaType === 'image' && videoValue) {
      onVideoChange('');
    } else if (mediaType === 'video' && imageValue) {
      onImageChange('');
    }
  }, [mediaType]);

  const displayUrl = mediaType === 'image' ? (imageValue || previewUrl) : (videoValue || previewUrl);

  const processAndUploadImage = async (file: File) => {
    setLocalError(null);
    setCompressionInfo(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Invalid file type. Please upload JPG, PNG, or WebP.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    let processedFile = file;
    const originalSize = file.size;

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
      onImageChange(url);
      setPreviewUrl(null);
    }
  };

  const processAndUploadVideo = async (file: File) => {
    setLocalError(null);
    setCompressionInfo(null);

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Invalid video type. Please upload MP4, WebM, or MOV.');
      return;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setLocalError('Video size must be less than 20MB. Try a shorter clip.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const response = await uploadService.uploadVideo(file, 'product-videos', (p) => setProgress(p));
      if (response?.url) {
        onVideoChange(response.url);
        setPreviewUrl(null);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Failed to upload video');
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndUploadImage(file);
    }
    e.target.value = '';
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndUploadVideo(file);
    }
    e.target.value = '';
  };

  const handleRemove = () => {
    if (mediaType === 'image') {
      onImageChange('');
    } else {
      onVideoChange('');
    }
    setPreviewUrl(null);
    setLocalError(null);
    setCompressionInfo(null);
    reset();
  };

  const isProcessing = isUploading || isCompressing;
  const statusText = isCompressing ? 'Compressing...' : `${progress}% uploaded`;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      
      {/* Media Type Toggle */}
      <RadioGroup 
        value={mediaType} 
        onValueChange={(v) => setMediaType(v as 'image' | 'video')}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="image" id="media-image" />
          <Label htmlFor="media-image" className="flex items-center gap-1.5 cursor-pointer">
            <Image className="w-4 h-4" />
            Image
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="video" id="media-video" />
          <Label htmlFor="media-video" className="flex items-center gap-1.5 cursor-pointer">
            <Video className="w-4 h-4" />
            Video
          </Label>
        </div>
      </RadioGroup>
      
      <div 
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 ${
          isProcessing ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'
        }`}
      >
        {/* Hidden inputs for images */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleImageFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={isProcessing || mediaType !== 'image'}
        />
        <input
          type="file"
          ref={galleryInputRef}
          onChange={handleImageFileChange}
          accept="image/*"
          className="hidden"
          disabled={isProcessing || mediaType !== 'image'}
        />

        {/* Hidden inputs for videos */}
        <input
          type="file"
          ref={videoCameraRef}
          onChange={handleVideoFileChange}
          accept="video/*"
          capture="environment"
          className="hidden"
          disabled={isProcessing || mediaType !== 'video'}
        />
        <input
          type="file"
          ref={videoInputRef}
          onChange={handleVideoFileChange}
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          disabled={isProcessing || mediaType !== 'video'}
        />

        {displayUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg group">
            {mediaType === 'video' ? (
              <video
                src={displayUrl}
                autoPlay
                loop
                muted
                playsInline
                className={`w-full h-full object-cover ${isProcessing ? 'opacity-50' : ''}`}
              />
            ) : (
              <img 
                src={displayUrl} 
                alt="Uploaded" 
                className={`w-full h-full object-cover ${isProcessing ? 'opacity-50' : ''}`}
              />
            )}
            
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
            ) : mediaType === 'image' ? (
              <>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Image className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium mb-1">Upload product image</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WebP (max. 5MB)</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => cameraInputRef.current?.click()}
                    className="min-h-[44px] flex-1 min-w-[120px] max-w-[160px]"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => galleryInputRef.current?.click()}
                    className="min-h-[44px] flex-1 min-w-[120px] max-w-[160px]"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Video className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium mb-1">Upload product video</p>
                  <p className="text-xs text-muted-foreground">MP4, WebM or MOV (max. 20MB)</p>
                  <p className="text-xs text-muted-foreground">Tip: Keep videos under 30 seconds</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => videoCameraRef.current?.click()}
                    className="min-h-[44px] flex-1 min-w-[120px] max-w-[160px]"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Record Video
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
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