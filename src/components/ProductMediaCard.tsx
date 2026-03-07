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

  const handleMouseEnter = () => {
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

  // Has video — show image by default, play video on hover
  if (videoUrl && imageUrl) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image shown by default */}
        <img
          src={imageUrl}
          alt={alt}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        />
        {/* Video overlaid, visible on hover */}
        <video
          ref={videoRef}
          src={videoUrl}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          muted
          loop
          playsInline
          preload="auto"
        />
        {/* Play icon overlay when not hovering */}
        {!isHovered && (
          <div className="absolute bottom-2 right-2 bg-black/60 rounded-full p-1.5 pointer-events-none">
            <Play className="w-3.5 h-3.5 text-white fill-white" />
          </div>
        )}
        {children}
      </div>
    );
  }

  // Video only — show paused video as poster, play on hover
  if (videoUrl) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          muted
          loop
          playsInline
          preload="auto"
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
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {children}
      </div>
    );
  }

  // No media — render children only (caller provides fallback)
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
