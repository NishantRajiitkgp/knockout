"use client";

import { useCallback, useEffect, useRef } from "react";

const ITEM_H = 36;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2);

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

function to12(value: string) {
  const [hRaw, mRaw] = value.split(":");
  const h24 = Number(hRaw) || 0;
  const m = Math.min(59, Math.max(0, Number(mRaw) || 0));
  const periodIdx = h24 >= 12 ? 1 : 0;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { hourIdx: h12 - 1, minIdx: m, periodIdx };
}

function to24(hourIdx: number, minIdx: number, periodIdx: number): string {
  const h12 = hourIdx + 1;
  let h24: number;
  if (periodIdx === 1) h24 = h12 === 12 ? 12 : h12 + 12;
  else h24 = h12 === 12 ? 0 : h12;
  return `${String(h24).padStart(2, "0")}:${String(minIdx).padStart(2, "0")}`;
}

/**
 * iOS-style scroll wheel time picker (hour · minute · AM/PM).
 * Built on native scroll-snap so it feels right on touch *and* desktop,
 * with a center selection band and top/bottom fade. No native time input.
 */
export function TimeWheel({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { hourIdx, minIdx, periodIdx } = to12(value);

  const set = useCallback(
    (h: number, m: number, p: number) => onChange(to24(h, m, p)),
    [onChange]
  );

  return (
    <div className="relative select-none">
      <div
        className="pointer-events-none absolute inset-x-0 z-10 rounded-lg border-y border-hairline-strong bg-white/[0.035]"
        style={{ top: ITEM_H * PAD, height: ITEM_H }}
      />
      <div className="wheel-mask flex items-stretch justify-center gap-0.5">
        <WheelColumn
          items={HOURS}
          index={hourIdx}
          onChange={(i) => set(i, minIdx, periodIdx)}
          ariaLabel="Hour"
          align="end"
          width={48}
        />
        <div
          className="flex items-center justify-center text-[18px] font-semibold text-ink"
          style={{ height: ITEM_H * VISIBLE }}
        >
          :
        </div>
        <WheelColumn
          items={MINUTES}
          index={minIdx}
          onChange={(i) => set(hourIdx, i, periodIdx)}
          ariaLabel="Minute"
          align="start"
          width={48}
        />
        <WheelColumn
          items={PERIODS}
          index={periodIdx}
          onChange={(i) => set(hourIdx, minIdx, i)}
          ariaLabel="AM or PM"
          align="center"
          width={54}
        />
      </div>
    </div>
  );
}

function WheelColumn({
  items,
  index,
  onChange,
  ariaLabel,
  align,
  width,
}: {
  items: string[];
  index: number;
  onChange: (i: number) => void;
  ariaLabel: string;
  align: "start" | "end" | "center";
  width: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<number | null>(null);

  // Keep scroll position in sync when the value changes from outside.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = index * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 1) el.scrollTop = target;
  }, [index]);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (settle.current) window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)));
      if (i !== index) onChange(i);
    }, 110);
  };

  const justify =
    align === "end" ? "justify-end pr-1.5" : align === "start" ? "justify-start pl-1.5" : "justify-center";

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      role="listbox"
      aria-label={ariaLabel}
      className="hide-scrollbar snap-y snap-mandatory overflow-y-scroll overscroll-contain"
      style={{ height: ITEM_H * VISIBLE, width, scrollSnapType: "y mandatory" }}
    >
      <div style={{ height: ITEM_H * PAD }} />
      {items.map((it, i) => (
        <button
          type="button"
          key={it}
          onClick={() => onChange(i)}
          aria-selected={i === index}
          className={`flex w-full items-center ${justify} tabular text-[18px] leading-none transition-colors ${
            i === index ? "font-semibold text-ink" : "text-ash"
          }`}
          style={{ height: ITEM_H, scrollSnapAlign: "center" }}
        >
          {it}
        </button>
      ))}
      <div style={{ height: ITEM_H * PAD }} />
    </div>
  );
}
