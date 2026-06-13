import { type PointerEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;

interface ProductMediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  videoUrl?: string | null;
  posterUrl?: string | null;
  alt: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getPointerDistance = (pointers: Map<number, { x: number; y: number }>) => {
  const [first, second] = Array.from(pointers.values());
  if (!first || !second) return 0;
  return Math.hypot(second.x - first.x, second.y - first.y);
};

export const ProductMediaLightbox = ({
  isOpen,
  onClose,
  imageUrl,
  videoUrl,
  posterUrl,
  alt,
}: ProductMediaLightboxProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);
  const panStartRef = useRef<{ x: number; y: number; translateX: number; translateY: number } | null>(null);
  const lastTapRef = useRef(0);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const resetZoom = () => {
    setZoom(MIN_ZOOM);
    setTranslate({ x: 0, y: 0 });
  };

  const changeZoom = (nextZoom: number | ((currentZoom: number) => number)) => {
    setZoom((currentZoom) => {
      const resolvedZoom = typeof nextZoom === "function" ? nextZoom(currentZoom) : nextZoom;
      const clampedZoom = clamp(resolvedZoom, MIN_ZOOM, MAX_ZOOM);
      if (clampedZoom === MIN_ZOOM) {
        setTranslate({ x: 0, y: 0 });
      }
      return clampedZoom;
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const activePointers = pointersRef.current;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      previousFocusRef.current?.focus();
      resetZoom();
      activePointers.clear();
      pinchStartRef.current = null;
      panStartRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        changeZoom((currentZoom) => currentZoom + 0.25);
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        changeZoom((currentZoom) => currentZoom - 0.25);
      } else if (event.key === "0") {
        event.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 2) {
      pinchStartRef.current = { distance: getPointerDistance(pointersRef.current), zoom };
      panStartRef.current = null;
      return;
    }

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      changeZoom((currentZoom) => (currentZoom === MIN_ZOOM ? DOUBLE_TAP_ZOOM : MIN_ZOOM));
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    if (zoom > MIN_ZOOM) {
      panStartRef.current = { x: event.clientX, y: event.clientY, translateX: translate.x, translateY: translate.y };
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size >= 2 && pinchStartRef.current) {
      const distance = getPointerDistance(pointersRef.current);
      if (distance > 0 && pinchStartRef.current.distance > 0) {
        changeZoom(pinchStartRef.current.zoom * (distance / pinchStartRef.current.distance));
      }
      return;
    }

    if (zoom > MIN_ZOOM && panStartRef.current) {
      setTranslate({
        x: panStartRef.current.translateX + event.clientX - panStartRef.current.x,
        y: panStartRef.current.translateY + event.clientY - panStartRef.current.y,
      });
    }
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    pinchStartRef.current = null;
    panStartRef.current = null;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} media viewer`}
    >
      <div className="absolute right-3 top-3 z-10 flex gap-2 sm:right-5 sm:top-5">
        <Button type="button" variant="secondary" size="icon" onClick={() => changeZoom((currentZoom) => currentZoom + 0.25)} aria-label="Zoom in">
          <Plus className="h-5 w-5" />
        </Button>
        <Button type="button" variant="secondary" size="icon" onClick={() => changeZoom((currentZoom) => currentZoom - 0.25)} aria-label="Zoom out">
          <Minus className="h-5 w-5" />
        </Button>
        <Button type="button" variant="secondary" size="icon" onClick={resetZoom} aria-label="Reset zoom">
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button ref={closeButtonRef} type="button" variant="secondary" size="icon" onClick={onClose} aria-label="Close media viewer">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div
        className="flex min-h-0 flex-1 touch-none select-none items-center justify-center overflow-hidden p-4 pt-20"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
            style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})` }}
            controls
            autoPlay
            muted
            loop
            playsInline
            poster={posterUrl || imageUrl || undefined}
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={alt}
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl transition-transform duration-75"
            draggable={false}
            style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})` }}
          />
        ) : null}
      </div>
    </div>,
    document.body,
  );
};
