"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function LiveClock({
  withSeconds = false,
  className,
}: {
  withSeconds?: boolean;
  className?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const label = now
    ? now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        ...(withSeconds ? { second: "2-digit" } : {}),
      })
    : "--:--";

  return <span className={cn("tabular", className)}>{label}</span>;
}
