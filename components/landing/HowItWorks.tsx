import { Reveal } from "./Reveal";
import { SpotlightCard } from "@/components/fx/SpotlightCard";
import { CountUp } from "@/components/fx/CountUp";

const steps = [
  {
    n: "01",
    title: "Tell us when you started",
    body: "One tap when you arrive. Type a time, or take the default of right now. That's the entire setup.",
    keys: ["9", ":", "0", "2"],
  },
  {
    n: "02",
    title: "Set the shape of your day",
    body: "Eight hours, thirty minutes by default. Stretch it for a long one, trim it for a half-day. Yours to bend.",
    keys: ["8", "h", "30"],
  },
  {
    n: "03",
    title: "We knock you out, on time",
    body: "At the exact second your day is done, we hit your inbox and your screen. Punch out. Breathe. Go.",
    keys: ["↵"],
  },
];

const stats = [
  { to: 8.5, suffix: "h", decimals: 1, label: "Default day, fully editable" },
  { to: 2, suffix: "", decimals: 0, label: "Channels: email + push" },
  { to: 0, suffix: "", decimals: 0, label: "Timers running on your device" },
  { to: 1, suffix: " tap", decimals: 0, label: "To set the whole thing up" },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-20 border-t border-hairline">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-2xl">
          <Reveal>
            <h2 className="text-display-lg font-semibold text-ink">
              Thirty seconds now.
              <br />
              Never a forgotten night again.
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 100}>
              <SpotlightCard className="group h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="tabular text-[13px] text-ash">{step.n}</span>
                  <div className="flex items-center gap-1">
                    {step.keys.map((k, idx) => (
                      <span key={idx} className="keycap">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="mt-8 text-[19px] font-medium leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-mute">
                  {step.body}
                </p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-hairline bg-surface p-2 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-md px-5 py-6 text-center">
                <p className="text-display-lg font-semibold text-ink">
                  <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals} />
                </p>
                <p className="mt-1.5 text-[12.5px] leading-snug text-mute">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
