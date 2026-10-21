"use client";

import { useEffect, type RefObject } from "react";

/**
 * Invokes `onOutsideClick` when a pointer event lands outside `ref`.
 * Attach the ref to a wrapper that contains both the trigger and the
 * floating panel so clicks inside the panel don't count as "outside".
 * No-op while `isEnabled` is false.
 */
const useOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
  isEnabled = true,
) => {
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      if (element && !element.contains(event.target as Node)) {
        onOutsideClick();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [ref, onOutsideClick, isEnabled]);
};

export default useOutsideClick;
