"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        "spotlight rounded-lg border border-hairline bg-surface",
        className
      )}
    >
      {children}
    </div>
  );
}
