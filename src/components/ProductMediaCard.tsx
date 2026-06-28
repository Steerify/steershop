import { useEffect, useRef, useState } from "react";
import { Package, Play } from "lucide-react";

/**
 * Props for ProductMediaCard component
 */
interface ProductMediaCardProps {
  imageUrl?: string | null;
  videoUrl?: string | null;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * ProductMediaCard displays product media (image and/or video) with fallback support
 *
 * @param imageUrl - URL of the product image (optional)
 * @param videoUrl - URL of the product video (optional)
 * @param alt - Alt text for the product media
 * @param className - Additional CSS classes for the container
 * @param children - Optional children elements to render over the media
 */
export const ProductMediaCard = ({
  imageUrl,
  videoUrl,
  alt,
  className = "",
  children,
}: ProductMediaCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  /**
   * Reset image failure state when image URL changes
   */
  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  /**
   * Reset video failure state when video URL changes
   */
  useEffect(() => {
    setVideoFailed(false);
  }, [videoUrl]);

  /**
   * Handle mouse enter event to start playing video
   */
  const handleMouseEnter = () => {
    if (videoFailed || isHovered) return;
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        // Silently handle autoplay failures (common on mobile browsers)
        console.debug("[ProductMediaCard] Video autoplay failed:", error);
      });
    }
  };

  /**
   * Handle mouse leave event to pause and reset video
   */
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  /**
   * Handle video error event
   */
  const handleVideoError = () => {
    setVideoFailed(true);
    setIsHovered(false);
  };

  const effectiveImageUrl = imageFailed ? null : imageUrl;
  // If video failed, treat as image-only
  const effectiveVideoUrl = videoFailed ? null : videoUrl;

  /**
   * Fallback UI when no media is available or media failed to load
   */
  const fallback = (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/15 via-accent/15 to-emerald-500/10 px-4 text-center">
      <div className="rounded-3xl bg-background/80 p-4 shadow-lg ring-1 ring-border/40 backdrop-blur-md">
        <Package
          className="h-9 w-9 text-primary/80 sm:h-10 sm:w-10"
          aria-hidden="true"
        />
      </div>
      <span className="text-[12px] font-semibold leading-tight text-muted-foreground sm:text-sm">
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
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${isHovered ? "opacity-0" : "opacity-100"}`}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
        <video
          ref={videoRef}
          src={effectiveVideoUrl}
          data-testid="product-media-video"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out ${isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"}`}
          muted
          loop
          playsInline
          preload="metadata"
          onError={handleVideoError}
          aria-label={`${alt} video`}
        />
        {!isHovered && (
          <div
            className="absolute bottom-3 right-3 bg-black/70 rounded-2xl p-2 pointer-events-none shadow-lg backdrop-blur-sm"
            aria-hidden="true"
          >
            <Play
              className="w-4 h-4 text-white fill-white"
              aria-hidden="true"
            />
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
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          muted
          loop
          playsInline
          preload="metadata"
          onError={handleVideoError}
          aria-label={alt}
        />
        {!isHovered && (
          <div
            className="absolute bottom-3 right-3 bg-black/70 rounded-2xl p-2 pointer-events-none shadow-lg backdrop-blur-sm"
            aria-hidden="true"
          >
            <Play
              className="w-4 h-4 text-white fill-white"
              aria-hidden="true"
            />
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
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
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
