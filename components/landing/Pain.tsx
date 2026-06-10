import { Reveal } from "./Reveal";

const beats = [
  {
    time: "6:14 PM",
    line: "You shut the laptop. You mean to punch out. The lift arrives first.",
  },
  {
    time: "9:40 PM",
    line: "Dinner, a show, a slow exhale. The day finally feels like yours.",
  },
  {
    time: "11:23 PM",
    line: "Lights off. Then the jolt — you never clocked out. Again.",
  },
  {
    time: "8:02 AM",
    line: "An email from HR. A correction form. A small, avoidable shame.",
  },
];

export function Pain() {
  return (
    <section id="problem" className="relative scroll-mt-20">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <h2 className="text-display-lg font-semibold text-ink">
                Punching in is a habit.
                <br />
                Punching out is a&nbsp;
                <span className="text-mute">memory test</span> you keep failing.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-body">
                It&apos;s never laziness. The morning has a trigger &mdash; the
                door, the desk, the first coffee. The evening doesn&apos;t. You
                just leave, like a normal human, and the clock keeps running
                without you.
              </p>
            </Reveal>
          </div>

          <div className="relative">
            <div className="absolute left-[6px] top-2 bottom-2 w-px bg-hairline" aria-hidden="true" />
            <ul className="space-y-3">
              {beats.map((beat, i) => (
                <Reveal as="li" key={beat.time} delay={i * 90}>
                  <div className="relative rounded-lg border border-hairline bg-surface p-5 pl-8">
                    <span
                      className={`absolute left-[1px] top-7 h-3 w-3 rounded-full border-2 border-canvas ${
                        i === beats.length - 1 ? "bg-accent-red" : "bg-stone"
                      }`}
                    />
                    <p className="font-mono text-[12px] tracking-tight text-ash">
                      {beat.time}
                    </p>
                    <p className="mt-1.5 text-[16px] leading-snug text-ink">
                      {beat.line}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
