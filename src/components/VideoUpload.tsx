import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, Loader2, Video } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/integrations/supabase/client';

const MAX_HEIGHT = 720;

const compressVideo = (
  file: File,
  onProgress?: (percent: number) => void
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      let width = video.videoWidth;
      let height = video.videoHeight;
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      video.currentTime = 0;
      video.play().catch(reject);

      // Track compression progress via timeupdate
      const duration = video.duration;
      video.ontimeupdate = () => {
        if (duration > 0 && onProgress) {
          const pct = Math.min(Math.round((video.currentTime / duration) * 100), 99);
          onProgress(pct);
        }
      };

      const stream = canvas.captureStream(30);

      let mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('unsupported'));
          return;
        }
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 1_000_000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        URL.revokeObjectURL(objectUrl);
        onProgress?.(100);
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };
      recorder.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('unsupported'));
      };

      recorder.start();

      const drawFrame = () => {
        if (video.ended || video.paused) {
          recorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        requestAnimationFrame(drawFrame);
      };
      requestAnimationFrame(drawFrame);

      video.onended = () => {
        setTimeout(() => recorder.stop(), 100);
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load video'));
    };
  });
};

const uploadWithProgress = (
  filePath: string,
  blob: Blob,
  token: string,
  onProgress?: (percent: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/product-videos/${filePath}`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(xhr.responseText || `Upload failed with status ${xhr.status}`));
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
    if (!validTypes.includes(file.type)) {
      setError('Invalid format. Please upload MP4, WebM, or MOV.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Compress video (0–50%)
      let uploadBlob: Blob = file;
      let ext = file.name.split('.').pop() || 'mp4';

      try {
        setStatusText('Compressing... 0%');
        const compressed = await compressVideo(file, (pct) => {
          const mapped = Math.round(pct * 0.5);
          setProgress(mapped);
          setStatusText(`Compressing... ${pct}%`);
        });
        const savedPercent = Math.round(((file.size - compressed.size) / file.size) * 100);
        console.log(`Video compressed: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(compressed.size / 1024 / 1024).toFixed(1)}MB (${savedPercent}% smaller)`);
        uploadBlob = compressed;
        ext = 'webm';
      } catch (err: any) {
        console.warn('Video compression not supported, uploading original:', err.message);
      }

      // Resolve shop ID
      setStatusText('Preparing upload...');
      setProgress(50);

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

      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `${resolvedShopId}/${fileName}`;

      // Upload with real progress (50–95%)
      await uploadWithProgress(filePath, uploadBlob, session.access_token, (pct) => {
        const mapped = 50 + Math.round(pct * 0.45);
        setProgress(mapped);
        setStatusText(`Uploading... ${pct}%`);
      });

      // Finalize (95–100%)
      setProgress(95);
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
                <p className="text-xs text-muted-foreground">MP4, WebM or MOV · auto-compressed</p>
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
