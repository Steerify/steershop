import { useRef, useState } from "react";
import { Play } from "lucide-react";

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

  // If video failed, treat as image-only
  const effectiveVideoUrl = videoFailed ? null : videoUrl;

  // Has video + image — show image by default, play video on hover
  if (effectiveVideoUrl && imageUrl) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={imageUrl}
          alt={alt}
          data-testid="product-media-image"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
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
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={imageUrl}
          alt={alt}
          data-testid="product-media-image"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {children}
      </div>
    );
  }

  // No media
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
