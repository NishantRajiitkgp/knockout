"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@*";

/** Decodes target text from random glyphs once it scrolls into view. */
export function ScrambleText({
  text,
  className,
  duration = 900,
}: {
  text: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(text);
      return;
    }

    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        const revealed = Math.floor(p * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          if (text[i] === " ") out += " ";
          else if (i < revealed) out += text[i];
          else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setDisplay(out);
        if (p < 1) requestAnimationFrame(tick);
        else setDisplay(text);
      };
      requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run();
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [text, duration]);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {display}
    </span>
  );
}
