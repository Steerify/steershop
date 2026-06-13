import { useEffect, useRef, useState } from "react";
import { Package, Play } from "lucide-react";

interface ProductMediaCardProps {
  imageUrl?: string | null;
  videoUrl?: string | null;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}

export const ProductMediaCard = ({ imageUrl, videoUrl, alt, className = "", children }: ProductMediaCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  useEffect(() => {
    setVideoFailed(false);
  }, [videoUrl]);

  const handleMouseEnter = () => {
    if (videoFailed || isHovered) return;
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleVideoError = () => {
    setVideoFailed(true);
    setIsHovered(false);
  };

  const effectiveImageUrl = imageFailed ? null : imageUrl;
  // If video failed, treat as image-only
  const effectiveVideoUrl = videoFailed ? null : videoUrl;

  const fallback = (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 via-accent/10 to-emerald-500/10 px-3 text-center">
      <div className="rounded-2xl bg-background/70 p-3 shadow-sm ring-1 ring-border/50 backdrop-blur-sm">
        <Package className="h-7 w-7 text-primary/70 sm:h-8 sm:w-8" />
      </div>
      <span className="text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">
        Product image unavailable
      </span>
    </div>
  );

  // Has video + image — show image by default, play video on hover
  if (effectiveVideoUrl && effectiveImageUrl) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={effectiveImageUrl}
          alt={alt}
          data-testid="product-media-image"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
        <video
          ref={videoRef}
          src={effectiveVideoUrl}
          data-testid="product-media-video"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          muted
          loop
          playsInline
          preload="metadata"
          onError={handleVideoError}
        />
        {!isHovered && (
          <div className="absolute bottom-2 right-2 bg-black/60 rounded-full p-1.5 pointer-events-none">
            <Play className="w-3.5 h-3.5 text-white fill-white" />
          </div>
        )}
        {children}
      </div>
    );
  }

  // Video only
  if (effectiveVideoUrl) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          src={effectiveVideoUrl}
          data-testid="product-media-video"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          muted
          loop
          playsInline
          preload="metadata"
          onError={handleVideoError}
        />
        {!isHovered && (
          <div className="absolute bottom-2 right-2 bg-black/60 rounded-full p-1.5 pointer-events-none">
            <Play className="w-3.5 h-3.5 text-white fill-white" />
          </div>
        )}
        {children}
      </div>
    );
  }

  // Image only
  if (effectiveImageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={effectiveImageUrl}
          alt={alt}
          data-testid="product-media-image"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
        {children}
      </div>
    );
  }

  // No media or failed media
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {fallback}
      {children}
    </div>
  );
};
