"use client";

import { useRef, type MouseEvent } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Magnetic-pull hover. Returns a ref + handlers to spread onto any element.
 * No-ops when the user prefers reduced motion.
 */
export function useMagnetic(strength = 14) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const onMouseMove = (e: MouseEvent) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${(x / rect.width) * strength * 2}px, ${
      (y / rect.height) * strength * 2
    }px)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0, 0)";
  };

  return { ref, onMouseMove, onMouseLeave };
}

export const MAGNETIC_TRANSITION = "transform 0.25s cubic-bezier(0.22,1,0.36,1)";
