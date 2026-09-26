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
  const isHorizontalScroll = useRef<boolean | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    if (!enabled || e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
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
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontalScroll.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalScroll.current) {
      setIsDragging(true);
      let offset = diffX;
      // Resistance at edges
      if ((currentIndex === 0 && offset > 0) || (currentIndex === tabs.length - 1 && offset < 0)) {
        offset = offset * 0.25;
      }
      setDragOffset(offset);
    }
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null) return;

    if (isDragging) {
      const threshold = 45; // px
      if (dragOffset < -threshold && currentIndex < tabs.length - 1) {
        onTabChange(tabs[currentIndex + 1]);
      } else if (dragOffset > threshold && currentIndex > 0) {
        onTabChange(tabs[currentIndex - 1]);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
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
