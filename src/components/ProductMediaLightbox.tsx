import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { Button } from "@/components/ui/button";

interface ProductMediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  videoUrl?: string | null;
  posterUrl?: string | null;
  alt: string;
}

export const ProductMediaLightbox = ({
  isOpen,
  onClose,
  imageUrl,
  videoUrl,
  posterUrl,
  alt,
}: ProductMediaLightboxProps) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} media viewer`}
    >
      <div className="absolute right-3 top-3 z-50">
        <Button type="button" variant="secondary" size="icon" onClick={onClose} aria-label="Close media viewer">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 pt-20 pb-20">
        {videoUrl ? (
          <video
            src={videoUrl}
            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            controls
            autoPlay
            muted
            loop
            playsInline
            poster={posterUrl || imageUrl || undefined}
          />
        ) : imageUrl ? (
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={4}
            centerOnInit
            wheel={{ step: 0.1 }}
            doubleClick={{ step: 1.5 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomOut()}
                    className="h-10 w-10 rounded-xl text-white hover:bg-white/20"
                    aria-label="Zoom out"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <div className="w-px h-6 bg-white/20" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => resetTransform()}
                    className="h-10 w-10 rounded-xl text-white hover:bg-white/20"
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  <div className="w-px h-6 bg-white/20" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomIn()}
                    className="h-10 w-10 rounded-xl text-white hover:bg-white/20"
                    aria-label="Zoom in"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt={alt}
                    className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl pointer-events-auto cursor-grab active:cursor-grabbing"
                    draggable={false}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};
