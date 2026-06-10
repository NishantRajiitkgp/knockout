"use client";

import { useEffect, useMemo, useState } from "react";
import { LiveClock } from "@/components/fx/LiveClock";

const rows = [
  { title: "Punch in", meta: "Today, 9:02 AM", icon: "in" as const },
  { title: "Working hours", meta: "8h 30m", icon: "hours" as const },
  { title: "Reminders", meta: "Email + Push", icon: "bell" as const },
];

function RowIcon({ kind }: { kind: "in" | "hours" | "bell" }) {
  const common = "h-4 w-4 text-mute";
  if (kind === "in")
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 12h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M19 4v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  if (kind === "hours")
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 8v4l2.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" className={common}>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.7 20a2 2 0 01-3.4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const CYCLE_START = 46; // seconds

export function CommandPalette() {
  const [remaining, setRemaining] = useState(CYCLE_START);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) return 0;
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining === 0 && !fired) {
      setFired(true);
      const reset = setTimeout(() => {
        setFired(false);
        setRemaining(CYCLE_START);
      }, 3400);
      return () => clearTimeout(reset);
    }
  }, [remaining, fired]);

  const targetStr = useMemo(() => {
    const d = new Date(Date.now() + remaining * 1000);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    // recomputed only when remaining changes; fine for a demo surface
  }, [remaining]);

  const mmss = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(
    remaining % 60
  ).padStart(2, "0")}`;

  return (
    <div className="relative w-full">
      <div className="palette-glow pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10" />
      <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
        {/* window chrome */}
        <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#2a2c2d]" />
            <span className="h-3 w-3 rounded-full bg-[#2a2c2d]" />
            <span className="h-3 w-3 rounded-full bg-[#2a2c2d]" />
          </div>
          <div className="ml-1 flex h-8 flex-1 items-center gap-2 rounded-md border border-hairline bg-surface-elevated px-3">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-ash">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="text-[13px] text-ash">Knockout</span>
            <span className="ml-auto text-[12px] text-stone">
              <LiveClock />
            </span>
          </div>
          <span className="keycap">⌘K</span>
        </div>

        {/* active reminder row */}
        <div className="px-2.5 pt-2.5">
          <div
            className={`flex items-center gap-3 rounded-md px-3 py-3 ring-1 transition-colors duration-500 ${
              fired ? "bg-accent-red/10 ring-accent-red/30" : "bg-surface-card ring-hairline"
            }`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-gradient-to-b from-surface-card to-surface">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full animate-pulse-dot rounded-full opacity-70 ${
                    fired ? "bg-accent-red" : "bg-accent-green"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    fired ? "bg-accent-red" : "bg-accent-green"
                  }`}
                />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-ink">
                {fired ? "Punch out now" : "Time to punch out"}
              </p>
              <p className="truncate text-[12px] text-mute">
                {fired ? (
                  <span className="text-accent-green">
                    Reminder sent · Email + Push ✓
                  </span>
                ) : (
                  `Scheduled for ${targetStr}`
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="tabular text-[15px] font-medium tracking-tight text-ink">
                {fired ? "00:00" : mmss}
              </p>
              <p className="text-[11px] text-ash">{fired ? "done" : "remaining"}</p>
            </div>
          </div>
        </div>

        {/* secondary rows */}
        <div className="px-2.5 pb-2 pt-1">
          {rows.map((row) => (
            <div
              key={row.title}
              className="flex items-center gap-3 rounded-sm px-3 py-2.5 transition-colors hover:bg-surface-elevated"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-surface-elevated">
                <RowIcon kind={row.icon} />
              </span>
              <span className="flex-1 text-[13px] text-body">{row.title}</span>
              <span className="text-[12px] text-ash">{row.meta}</span>
            </div>
          ))}
        </div>

        {/* footer bar */}
        <div className="flex items-center justify-between border-t border-hairline px-4 py-2.5">
          <div className="flex items-center gap-2 text-[12px] text-ash">
            <span className="keycap">↵</span>
            <span>Punch out</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-ash">
            <span>Actions</span>
            <span className="keycap">⌘</span>
            <span className="keycap">K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
