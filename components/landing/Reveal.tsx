"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms. */
  delay?: number;
  as?: "div" | "section" | "li" | "span";
};

export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  const setRef = useCallback((node: HTMLElement | null) => {
    elRef.current = node;
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const props = {
    ref: setRef,
    className: cn("reveal", visible && "is-visible", className),
    style: { transitionDelay: `${delay}ms` },
  };

  if (as === "section") return <section {...props}>{children}</section>;
  if (as === "li") return <li {...props}>{children}</li>;
  if (as === "span") return <span {...props}>{children}</span>;
  return <div {...props}>{children}</div>;
}
