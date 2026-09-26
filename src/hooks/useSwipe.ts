import React, { useState, useRef, useEffect, TouchEvent } from 'react';

interface UseInteractiveSliderOptions<T extends string> {
  tabs: readonly T[] | T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  enabled?: boolean;
}

export function useInteractiveSlider<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  enabled = true
}: UseInteractiveSliderOptions<T>) {
  const currentIndex = tabs.indexOf(activeTab);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const isHorizontalScroll = useRef<boolean | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    if (!enabled || e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isHorizontalScroll.current = null;
    setIsAnimating(true);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!enabled || touchStartX.current === null || touchStartY.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Detect if gesture is primarily horizontal
    if (isHorizontalScroll.current === null) {
      if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
        isHorizontalScroll.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalScroll.current) {
      setIsDragging(true);
      setDragOffset(diffX);
    }
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null) return;

    if (isDragging) {
      const elapsed = touchStartTime.current ? Date.now() - touchStartTime.current : 300;
      const isQuickFlick = elapsed < 300 && Math.abs(dragOffset) > 20;
      const threshold = isQuickFlick ? 20 : 35; // px

      if (dragOffset < -threshold) {
        // Dragged Left -> advance to next tab (or loop to first if on last tab)
        if (currentIndex < tabs.length - 1) {
          onTabChange(tabs[currentIndex + 1]);
        } else {
          onTabChange(tabs[0]);
        }
      } else if (dragOffset > threshold) {
        // Dragged Right -> go to previous tab (or loop to last if on first tab)
        if (currentIndex > 0) {
          onTabChange(tabs[currentIndex - 1]);
        } else {
          onTabChange(tabs[tabs.length - 1]);
        }
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
    touchStartTime.current = null;
    isHorizontalScroll.current = null;

    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 320);
  };

  // Trigger animation window on activeTab change
  useEffect(() => {
    setIsAnimating(true);
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 320);
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, [activeTab]);

  const numTabs = tabs.length;
  const basePercent = -(currentIndex * 100);

  const containerStyle: React.CSSProperties = {
    width: `${numTabs * 100}%`,
    transform: isDragging
      ? `translateX(calc(${basePercent / numTabs}% + ${dragOffset}px))`
      : `translateX(${basePercent / numTabs}%)`,
    transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
    willChange: 'transform'
  };

  const isSlideActive = (idx: number) => {
    return isDragging || isAnimating || currentIndex === idx;
  };

  return {
    currentIndex,
    isDragging,
    isAnimating,
    isSlideActive,
    containerStyle,
    swipeHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd
    }
  };
}
