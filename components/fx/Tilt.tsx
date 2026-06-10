"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function Tilt({
  children,
  className,
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${
      -py * max
    }deg)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
  };

  return (
    <div style={{ perspective: 900 }} className={className}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        className={cn("tilt")}
      >
        {children}
      </div>
    </div>
  );
}
