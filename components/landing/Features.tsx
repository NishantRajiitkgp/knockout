import { Reveal } from "./Reveal";
import { SpotlightCard } from "@/components/fx/SpotlightCard";

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 border-t border-hairline">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-2xl">
          <Reveal>
            <h2 className="text-display-lg font-semibold text-ink">
              A reminder that actually
              <span className="text-mute"> reaches you.</span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* big card */}
          <Reveal className="md:col-span-2 md:row-span-2">
            <SpotlightCard className="flex h-full flex-col justify-between p-7">
              <div>
                <div className="flex items-center gap-2">
                  <Chip color="green">Email</Chip>
                  <span className="text-ash">+</span>
                  <Chip color="blue">Push</Chip>
                </div>
                <h3 className="mt-6 max-w-md text-[24px] font-medium leading-snug text-ink">
                  Two taps on your shoulder, not one easy-to-miss buzz.
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-mute">
                  The moment your day is done, a browser notification lands on
                  your screen and an email lands in your inbox. If one slips by,
                  the other won&apos;t. You get walked out either way.
                </p>
              </div>
              <DualPing />
            </SpotlightCard>
          </Reveal>

          <Reveal delay={80}>
            <FeatureCard
              title="Precise to the second"
              body="Not 'sometime this hour.' We fire at the exact minute your hours are up — scheduled the instant you punch in."
            />
          </Reveal>

          <Reveal delay={160}>
            <FeatureCard
              title="Bend the hours anytime"
              body="8h 30m by default. Change it for a long day or a half-day, and we re-aim the reminder on the spot."
            />
          </Reveal>

          <Reveal delay={80}>
            <FeatureCard
              title="Sign in with Google"
              body="No new password to forget. Your work email is where the reminder lands."
            />
          </Reveal>

          <Reveal delay={160}>
            <FeatureCard
              title="We never watch you work"
              body="No activity tracking, no screenshots, no surveillance. We know when you started — nothing more — and when to stop you."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <SpotlightCard className="h-full p-6">
      <h3 className="text-[17px] font-medium leading-snug text-ink">{title}</h3>
      <p className="mt-2.5 text-[14px] leading-relaxed text-mute">{body}</p>
    </SpotlightCard>
  );
}

function Chip({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "green" | "blue";
}) {
  const styles =
    color === "green"
      ? "border-accent-green/25 bg-accent-green/10 text-accent-green"
      : "border-accent-blue/25 bg-accent-blue/10 text-accent-blue";
  return (
    <span
      className={`inline-flex items-center rounded-xs border px-2 py-0.5 text-[12px] font-medium ${styles}`}
    >
      {children}
    </span>
  );
}

function DualPing() {
  return (
    <div className="mt-8 flex items-center gap-3 rounded-md border border-hairline bg-surface-elevated px-4 py-3">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-accent-red opacity-70" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-red" />
      </span>
      <p className="text-[13px] text-body">
        <span className="text-ink">Knockout</span> · Time to punch out — it&apos;s
        5:32 PM
      </p>
    </div>
  );
}
