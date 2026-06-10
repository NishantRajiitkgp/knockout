import { Reveal } from "./Reveal";

/**
 * Raycast-style animated flow diagram.
 * One punch-in travels into the scheduler; at fire time a light-pulse
 * fans out to email + push. Pure CSS/SVG motion, reduced-motion safe.
 * Self-contained SVG (viewBox) so it scales crisply at every width.
 */
export function FlowDiagram() {
  return (
    <section id="flow" className="relative scroll-mt-20 border-t border-hairline">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-2xl">
          <Reveal>
            <h2 className="text-display-lg font-semibold text-ink">
              What happens after
              <br />
              you clock in.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-body">
              You punch in once. We schedule a single reminder for the exact
              second your day is done &mdash; then it fires to{" "}
              <span className="text-ink">two places at once</span>, so it can&apos;t
              slip past you.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="relative mt-12">
            <div className="palette-glow pointer-events-none absolute inset-0 -z-10" />
            <div className="rounded-xl border border-hairline bg-surface/60 p-4 sm:p-8">
              <Diagram />
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-3">
            <Legend
              k="9:02 AM"
              title="You punch in"
              body="One tap on arrival. That's the only thing you do."
            />
            <Legend
              k="Silent"
              title="We schedule once"
              body="A single reminder is queued. Nothing runs on your device."
            />
            <Legend
              k="5:32 PM"
              title="It fires to both"
              body="Email and push land together, the second your hours are up."
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Legend({ k, title, body }: { k: string; title: string; body: string }) {
  return (
    <div className="bg-surface px-5 py-5">
      <span className="keycap tabular">{k}</span>
      <p className="mt-3 text-[15px] font-medium text-ink">{title}</p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-mute">{body}</p>
    </div>
  );
}

function Diagram() {
  return (
    <svg
      viewBox="0 0 920 360"
      className="h-auto w-full"
      role="img"
      aria-label="Flow: punching in schedules one reminder, which fires to email and push at the same time."
    >
      <defs>
        <linearGradient id="ko-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a1131a" />
          <stop offset="55%" stopColor="#ff5757" />
          <stop offset="100%" stopColor="#ffb3b3" />
        </linearGradient>
      </defs>

      {/* ---- wires (base + animated beams) ---- */}
      {/* source -> core */}
      <path d="M244 180 H400" fill="none" stroke="#242728" strokeWidth={2} pathLength={100} />
      <path
        d="M244 180 H400"
        className="beam beam-1"
        fill="none"
        stroke="url(#ko-beam)"
        strokeWidth={2.5}
        strokeLinecap="round"
        pathLength={100}
      />
      {/* core -> email (up) */}
      <path
        d="M517 153 C 600 120, 640 110, 706 110"
        fill="none"
        stroke="#242728"
        strokeWidth={2}
        pathLength={100}
      />
      <path
        d="M517 153 C 600 120, 640 110, 706 110"
        className="beam beam-2"
        fill="none"
        stroke="url(#ko-beam)"
        strokeWidth={2.5}
        strokeLinecap="round"
        pathLength={100}
      />
      {/* core -> push (down) */}
      <path
        d="M517 207 C 600 240, 640 250, 706 250"
        fill="none"
        stroke="#242728"
        strokeWidth={2}
        pathLength={100}
      />
      <path
        d="M517 207 C 600 240, 640 250, 706 250"
        className="beam beam-2"
        fill="none"
        stroke="url(#ko-beam)"
        strokeWidth={2.5}
        strokeLinecap="round"
        pathLength={100}
      />

      {/* ---- source node ---- */}
      <g>
        <rect x={24} y={128} width={220} height={104} rx={14} fill="#121212" stroke="#242728" />
        <rect x={44} y={162} width={36} height={36} rx={9} fill="#101111" stroke="#242728" />
        <g transform="translate(50 168) scale(1)" stroke="#9c9c9d" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M10 17l5-5-5-5" />
          <path d="M4 12h11" />
          <path d="M19 4v16" />
        </g>
        <text x={96} y={176} fill="#f4f4f6" fontSize={19} fontWeight={600}>Punch in</text>
        <text x={96} y={202} fill="#9c9c9d" fontSize={14}>Today · 9:02 AM</text>
      </g>

      {/* ---- core node ---- */}
      <g>
        {/* static "timer" ring */}
        <circle cx={460} cy={180} r={70} fill="none" stroke="#242728" strokeDasharray="2 9" opacity={0.7} />
        {/* animated ping ring */}
        <circle cx={460} cy={180} r={58} className="core-ping" fill="none" stroke="#ff6161" strokeWidth={1.5} />
        {/* core disc */}
        <circle cx={460} cy={180} r={58} fill="#101111" stroke="#242728" />
        {/* Knockout mark */}
        <g transform="translate(442 150) scale(1.25)">
          <g stroke="#f4f4f6" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M7 3.6V20.4" />
            <path d="M7 12.4 16.4 4.6" />
            <path d="M7 11.6 16.8 20" />
          </g>
          <circle cx={18.4} cy={4.3} r={1.85} fill="#ff6161" />
        </g>
        <text x={460} y={216} fill="#cdcdcd" fontSize={13} textAnchor="middle">scheduled</text>
      </g>

      {/* ---- email node ---- */}
      <g>
        <rect x={706} y={70} width={190} height={80} rx={14} fill="#121212" stroke="#242728" />
        <rect x={722} y={92} width={36} height={36} rx={9} fill="#101111" stroke="#242728" />
        <g transform="translate(728 98)" stroke="#9c9c9d" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <rect x={3} y={5} width={18} height={14} rx={2.5} />
          <path d="M4 7l8 5 8-5" />
        </g>
        <text x={770} y={106} fill="#f4f4f6" fontSize={18} fontWeight={600}>Email</text>
        <text x={770} y={130} fill="#9c9c9d" fontSize={13}>to your inbox</text>
        <circle cx={876} cy={90} r={5} className="deliver" fill="#59d499" />
      </g>

      {/* ---- push node ---- */}
      <g>
        <rect x={706} y={210} width={190} height={80} rx={14} fill="#121212" stroke="#242728" />
        <rect x={722} y={232} width={36} height={36} rx={9} fill="#101111" stroke="#242728" />
        <g transform="translate(728 238)" stroke="#9c9c9d" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
          <path d="M13.7 20a2 2 0 01-3.4 0" />
        </g>
        <text x={770} y={246} fill="#f4f4f6" fontSize={18} fontWeight={600}>Push</text>
        <text x={770} y={270} fill="#9c9c9d" fontSize={13}>to your screen</text>
        <circle cx={876} cy={230} r={5} className="deliver" fill="#59d499" />
      </g>
    </svg>
  );
}
