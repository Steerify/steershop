import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, Loader2, Video } from 'lucide-react';
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

const uploadWithProgress = (
  filePath: string,
  blob: Blob,
  contentType: string,
  token: string,
  onProgress?: (percent: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/product-videos/${filePath}`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        let errorMsg = `Upload failed (${xhr.status})`;
        try {
          const resp = JSON.parse(xhr.responseText);
          errorMsg = resp.message || resp.error || errorMsg;
        } catch {}
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(blob);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setError(null);

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
    setProgress(0);

    try {
      // Resolve shop ID
      setStatusText('Preparing...');
      setProgress(5);

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

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated. Please log in and try again.');
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `${resolvedShopId}/${fileName}`;

      // Upload with real progress (5–95%)
      setStatusText('Uploading...');
      await uploadWithProgress(filePath, file, mimeType, session.access_token, (pct) => {
        const mapped = 5 + Math.round(pct * 0.9);
        setProgress(mapped);
        setStatusText(`Uploading... ${pct}%`);
      });

      // Finalize
      setProgress(98);
      setStatusText('Finalizing...');

      const { data: publicData } = supabase.storage
        .from('product-videos')
        .getPublicUrl(filePath);

      setProgress(100);
      onChange(publicData.publicUrl);
    } catch (err: any) {
      console.error('Video upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setStatusText('');
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
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
          <video
            src={value}
            className="w-full aspect-video object-cover"
            controls
            muted
            loop
            playsInline
            preload="auto"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
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
