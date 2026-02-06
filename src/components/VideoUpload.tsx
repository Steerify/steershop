import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, Loader2, Video } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  maxDurationSeconds?: number;
  maxSizeMB?: number;
}

const validateVideoDuration = (file: File, maxSeconds: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration <= maxSeconds);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve(false);
    };
    video.src = URL.createObjectURL(file);
  });
};

export const VideoUpload: React.FC<VideoUploadProps> = ({
  value,
  onChange,
  label = 'Short Video (max 10s)',
  className = '',
  maxDurationSeconds = 10,
  maxSizeMB = 20,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setError(null);

    // Validate type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid format. Please upload MP4, WebM, or MOV.');
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }

    // Validate duration
    setProgress(10);
    const validDuration = await validateVideoDuration(file, maxDurationSeconds);
    if (!validDuration) {
      setError(`Video must be ${maxDurationSeconds} seconds or shorter.`);
      setProgress(0);
      return;
    }

    // Upload
    setIsUploading(true);
    setProgress(30);

    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-videos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      setProgress(80);

      const { data: publicData } = supabase.storage
        .from('product-videos')
        .getPublicUrl(filePath);

      setProgress(100);
      onChange(publicData.publicUrl);
    } catch (err: any) {
      console.error('Video upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
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
        disabled={isUploading}
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
            isUploading ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="w-full space-y-1">
                <Progress value={progress} className="h-1" />
                <p className="text-xs text-center text-muted-foreground">Uploading... {progress}%</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Video className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium mb-1">Upload short video</p>
                <p className="text-xs text-muted-foreground">MP4, WebM or MOV (max {maxDurationSeconds}s, {maxSizeMB}MB)</p>
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
