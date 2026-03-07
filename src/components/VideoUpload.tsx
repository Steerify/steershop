import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, Loader2, Video, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/integrations/supabase/client';

const MAX_FILE_SIZE_MB = 50;

const getMimeType = (file: File): string => {
  if (file.type && file.type.startsWith('video/')) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp4': return 'video/mp4';
    case 'webm': return 'video/webm';
    case 'mov': return 'video/quicktime';
    default: return 'video/mp4';
  }
};

const validateVideoPlayback = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };

    const timeout = setTimeout(() => {
      cleanup();
      resolve(false);
    }, 15000);

    video.onloadeddata = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(true);
    };

    video.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(false);
    };

    video.src = url;
    video.load();
  });
};

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  shopId?: string;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  value,
  onChange,
  label = 'Product Video',
  className = '',
  shopId: propShopId,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval>>();

  const startProgressSimulation = (fileSizeMB: number) => {
    // Estimate upload time: ~2s per MB on decent connection
    const estimatedMs = Math.max(fileSizeMB * 2000, 3000);
    const steps = 50;
    const stepMs = estimatedMs / steps;
    let current = 5;

    progressInterval.current = setInterval(() => {
      current += (90 - current) * 0.08; // Asymptotic approach to 95
      if (current > 92) current = 92;
      setProgress(Math.round(current));
    }, stepMs);
  };

  const stopProgressSimulation = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = undefined;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setError(null);
    setVideoError(false);

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const mimeType = getMimeType(file);
    if (!validTypes.includes(mimeType)) {
      setError('Invalid format. Please upload MP4, WebM, or MOV.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setIsProcessing(true);
    setProgress(5);

    try {
      setStatusText('Preparing...');

      let resolvedShopId = propShopId;
      if (!resolvedShopId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: shop } = await supabase
            .from('shops')
            .select('id')
            .eq('owner_id', user.id)
            .single();
          resolvedShopId = shop?.id;
        }
      }

      if (!resolvedShopId) {
        throw new Error('Could not determine shop. Please try again.');
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `${resolvedShopId}/${fileName}`;

      // Start simulated progress
      setStatusText('Uploading...');
      startProgressSimulation(file.size / (1024 * 1024));

      // Upload using Supabase SDK
      const { data, error: uploadError } = await supabase.storage
        .from('product-videos')
        .upload(filePath, file, {
          contentType: mimeType,
          upsert: true,
        });

      stopProgressSimulation();

      if (uploadError) {
        throw new Error(uploadError.message || 'Upload failed. Please try again.');
      }

      setProgress(95);
      setStatusText('Validating video...');

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('product-videos')
        .getPublicUrl(data.path);

      const publicUrl = publicData.publicUrl;

      // Validate the uploaded video is playable
      const isPlayable = await validateVideoPlayback(publicUrl);
      if (!isPlayable) {
        // Delete the unplayable file
        await supabase.storage.from('product-videos').remove([data.path]);
        throw new Error('Video uploaded but cannot be played. Please try MP4 format recorded with your phone camera.');
      }

      setProgress(100);
      onChange(publicUrl);
    } catch (err: any) {
      console.error('Video upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      stopProgressSimulation();
      setIsProcessing(false);
      setStatusText('');
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
    setVideoError(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}

      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        disabled={isProcessing}
      />

      {value ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-border">
          {videoError ? (
            <div className="w-full aspect-video bg-muted flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">This video format may not be supported</p>
              <Button type="button" variant="outline" size="sm" onClick={handleRemove}>
                Remove & re-upload
              </Button>
            </div>
          ) : (
            <video
              src={value}
              className="w-full aspect-video object-cover"
              controls
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setVideoError(true)}
            />
          )}
          {!videoError && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-4 transition-all duration-200 ${
            isProcessing ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="w-full space-y-1">
                <Progress value={progress} className="h-1" />
                <p className="text-xs text-center text-muted-foreground">{statusText || `${progress}%`}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Video className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium mb-1">Upload short video</p>
                <p className="text-xs text-muted-foreground">MP4, WebM or MOV · max {MAX_FILE_SIZE_MB}MB</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                className="min-h-[44px]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Video
              </Button>
            </div>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
