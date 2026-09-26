import { useRef, TouchEvent } from 'react';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
  maxSwipeTimeMs?: number;
  enabled?: boolean;
}

export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 45,
  maxSwipeTimeMs = 800,
  enabled = true
}: UseSwipeOptions) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    if (!enabled || e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!enabled || touchStartX.current === null || touchStartY.current === null || touchStartTime.current === null) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchStartTime.current = null;
      return;
    }

    const elapsedTime = Date.now() - touchStartTime.current;
    if (elapsedTime <= maxSwipeTimeMs && e.changedTouches.length > 0) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const diffX = touchStartX.current - touchEndX;
      const diffY = touchStartY.current - touchEndY;

      if (Math.abs(diffX) >= minSwipeDistance && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
        if (diffX > 0) {
          // Swipe Left -> Next
          onSwipeLeft?.();
        } else {
          // Swipe Right -> Prev
          onSwipeRight?.();
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchStartTime.current = null;
  };

  return {
    onTouchStart,
    onTouchEnd
  };
};
