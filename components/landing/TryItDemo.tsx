"use client";

import { useEffect, useMemo, useState } from "react";
import { Reveal } from "./Reveal";

function fmtTime(totalMin: number) {
  const m = ((totalMin % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

export function TryItDemo() {
  const [punchIn, setPunchIn] = useState("09:00");
  const [hours, setHours] = useState(8.5);
  // null until mounted so SSR and first client render match (no Date.now drift).
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { outLabel, countdownLabel, past, nextDay } = useMemo(() => {
    const [h, m] = punchIn.split(":").map(Number);
    const inMin = (h || 0) * 60 + (m || 0);
    const outMinRaw = inMin + Math.round(hours * 60);
    const nextDay = outMinRaw >= 1440;

    if (now === null) {
      return { outLabel: fmtTime(outMinRaw), countdownLabel: "—", past: false, nextDay };
    }

    const target = new Date(now);
    target.setHours(0, 0, 0, 0);
    target.setMinutes(outMinRaw);

    let diff = Math.round((target.getTime() - now) / 1000);
    const past = diff < 0;

    const abs = Math.abs(diff);
    const hh = Math.floor(abs / 3600);
    const mm = Math.floor((abs % 3600) / 60);
    const ss = abs % 60;
    const countdownLabel = `${hh}h ${String(mm).padStart(2, "0")}m ${String(
      ss
    ).padStart(2, "0")}s`;

    return { outLabel: fmtTime(outMinRaw), countdownLabel, past, nextDay };
  }, [punchIn, hours, now]);

  const hoursLabel = `${Math.floor(hours)}h ${String(
    Math.round((hours % 1) * 60)
  ).padStart(2, "0")}m`;

  return (
    <section className="relative scroll-mt-20 border-t border-hairline">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-2xl">
          <Reveal>
            <h2 className="text-display-lg font-semibold text-ink">
              Move the dials.
              <span className="text-mute"> Watch your evening reappear.</span>
            </h2>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            {/* controls */}
            <div className="rounded-xl border border-hairline bg-surface p-6 sm:p-8">
              <label className="block">
                <span className="text-[13px] text-mute">I punched in at</span>
                <input
                  type="time"
                  value={punchIn}
                  onChange={(e) => setPunchIn(e.target.value)}
                  className="mt-2 w-full rounded-md border border-hairline bg-surface-elevated px-3 py-2.5 text-[18px] text-ink outline-none transition-colors focus:border-hairline-strong [color-scheme:dark]"
                />
              </label>

              <div className="mt-7">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] text-mute">Working hours</span>
                  <span className="tabular text-[15px] font-medium text-ink">
                    {hoursLabel}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={0.25}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="mt-3 w-full accent-[#ff6161]"
                  aria-label="Working hours"
                />
                <div className="mt-2 flex justify-between text-[11px] text-stone">
                  <span>1h</span>
                  <span>Default 8h 30m</span>
                  <span>12h</span>
                </div>
              </div>
            </div>

            {/* result */}
            <div className="relative overflow-hidden rounded-xl border border-hairline bg-surface p-6 sm:p-8">
              <div className="palette-glow pointer-events-none absolute inset-0 -z-0 opacity-70" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas/50 px-3 py-1 text-[12px] text-mute">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      past ? "bg-ash" : "animate-pulse-dot bg-accent-green"
                    }`}
                  />
                  {past ? "This time has passed today" : "Reminder scheduled"}
                </span>

                <p className="mt-6 text-[13px] text-mute">Knockout would knock you out at</p>
                <p className="tabular mt-1 text-display-lg font-semibold text-ink">
                  {outLabel}
                  {nextDay && (
                    <span className="ml-2 align-middle text-[13px] font-normal text-ash">
                      next day
                    </span>
                  )}
                </p>

                <div className="mt-6 rounded-lg border border-hairline bg-surface-elevated px-4 py-3">
                  <p className="text-[12px] text-ash">
                    {past ? "That would have fired" : "Counting down"}
                  </p>
                  <p className="tabular mt-0.5 text-[20px] font-medium text-ink">
                    {past ? `${countdownLabel} ago` : `in ${countdownLabel}`}
                  </p>
                </div>

                <p className="mt-5 text-[13px] leading-relaxed text-mute">
                  At that exact second, an email and a push notification reach you.
                  No timers running on your end. No app left open. Just a tap on the
                  shoulder when it counts.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
