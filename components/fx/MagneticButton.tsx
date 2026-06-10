"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { cn } from "@/lib/cn";
import { useMagnetic, MAGNETIC_TRANSITION } from "@/lib/useMagnetic";

type MagneticButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** strength of pull in px */
  strength?: number;
};

export function MagneticButton({
  href,
  children,
  className,
  strength = 14,
}: MagneticButtonProps) {
  const { ref, onMouseMove, onMouseLeave } = useMagnetic(strength);

  return (
    <Link
      ref={ref as RefObject<HTMLAnchorElement>}
      href={href}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(className)}
      style={{ transition: MAGNETIC_TRANSITION }}
    >
      {children}
    </Link>
  );
}
