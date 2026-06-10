"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function RotatingWord({
  words,
  className,
  interval = 2200,
}: {
  words: string[];
  className?: string;
  interval?: number;
}) {
  const [i, setI] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setI((prev) => (prev + 1) % words.length);
        setAnimating(false);
      }, 320);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="relative inline-block align-bottom">
      <span
        className={cn(
          "inline-block transition-all duration-300 ease-out",
          animating ? "-translate-y-2 opacity-0 blur-[2px]" : "translate-y-0 opacity-100 blur-0",
          className
        )}
      >
        {words[i]}
      </span>
    </span>
  );
}
