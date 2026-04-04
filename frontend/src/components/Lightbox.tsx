'use client';

import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: Array<{ url: string; caption?: string; alt?: string }>;
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}) => {
  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  // Touch/swipe handling
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onNext) {
      onNext();
    }
    if (isRightSwipe && onPrevious) {
      onPrevious();
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrevious) onPrevious();
    },
    [isOpen, onClose, onNext, onPrevious]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      {/* Previous button */}
      {hasMultiple && onPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute top-1/2 -translate-y-1/2 p-2 text-white transition-all hover:bg-white/20 hover:backdrop-blur-sm rounded-full z-10"
          style={{ marginLeft: '18px', left: 0 }}
          aria-label="Предыдущее фото"
        >
          <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" strokeWidth={2} />
        </button>
      )}

      {/* Next button */}
      {hasMultiple && onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute top-1/2 -translate-y-1/2 p-2 text-white transition-all hover:bg-white/20 hover:backdrop-blur-sm rounded-full z-10"
          style={{ marginRight: '18px', right: 0 }}
          aria-label="Следующее фото"
        >
          <ChevronRight className="h-6 w-6 md:h-8 md:w-8" strokeWidth={2} />
        </button>
      )}

      {/* Image container */}
      <div
        className="relative mx-2 md:mx-4 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Image with white frame */}
        <div
          className="relative bg-white rounded-md touch-none"
          style={{
            padding: '10px',
            filter: 'drop-shadow(1px 2px 5px rgba(0, 0, 0, 0.1)) drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.05))',
            maxWidth: 'min(90vw, 1200px)',
            maxHeight: '90vh',
            boxSizing: 'content-box',
          }}
        >
          {/* Close button - positioned in top right corner of image frame */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 rounded-full bg-white p-2 text-gray-700 shadow-lg transition-colors hover:bg-gray-100 z-20"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <img
            src={currentImage.url}
            alt={currentImage.alt || currentImage.caption || 'Фото'}
            className="max-h-[calc(90vh-20px)] w-auto object-contain select-none"
            style={{ maxWidth: 'min(calc(90vw-20px), 1180px)' }}
            draggable={false}
          />
        </div>

        {/* Caption */}
        {currentImage.caption && (
          <div className="max-w-2xl rounded-lg bg-white px-4 py-2 text-center text-sm text-gray-700 shadow-md">
            {currentImage.caption}
          </div>
        )}

        {/* Counter */}
        {hasMultiple && (
          <div className="rounded-full bg-white px-3 py-1 text-xs text-gray-700 shadow-md">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};
