import { useRef, type TouchEvent } from "react";

const SWIPE_MIN_PX = 40;

// Horizontal swipe on touch screens: onSwipe(1) for a swipe to the left
// (next), onSwipe(-1) for a swipe to the right (previous). Spread the result
// onto the element: <div {...swipe}>
export function useSwipe(onSwipe: (step: 1 | -1) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    start.current = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(e: TouchEvent) {
    const from = start.current;
    start.current = null;
    if (!from) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - from.x;
    const dy = touch.clientY - from.y;
    // short moves are taps, mostly vertical ones are scrolls
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dy) > Math.abs(dx)) return;

    // stops the browser from also turning this touch into a click
    if (e.cancelable) e.preventDefault();
    onSwipe(dx < 0 ? 1 : -1);
  }

  return { onTouchStart, onTouchEnd };
}
