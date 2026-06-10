import { CommandPalette } from "./CommandPalette";
import { Reveal } from "./Reveal";
import { Aurora } from "@/components/fx/Aurora";
import { Tilt } from "@/components/fx/Tilt";
import { RotatingWord } from "@/components/fx/RotatingWord";
import { SignInButton } from "@/components/auth/SignInButton";

function StripeBand() {
  return (
    <div className="stripe-band animate-stripe-drift" aria-hidden="true">
      <div className="stripe-bar left-[18%] opacity-90" />
      <div className="stripe-bar left-[34%] opacity-70" style={{ width: "12%" }} />
      <div className="stripe-bar left-[52%] opacity-50" style={{ width: "9%" }} />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <StripeBand />
      <Aurora className="-z-10 opacity-70" />
      <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto max-w-content px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* copy */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-[12px] text-mute">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent-red" />
                For everyone still secretly &ldquo;clocked in&rdquo;
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-display-xl font-semibold tracking-tightish text-mute">
                Your body went home.
                <br />
                <span className="text-ink">Your timesheet didn&apos;t.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-body">
                You never forget to show up. It&apos;s leaving that slips your
                mind &mdash; until 11&nbsp;PM, in bed, when it hits you:
                <span className="text-ink"> you never punched out.</span> Knockout
                watches the clock so you can finally{" "}
                <RotatingWord
                  className="font-medium text-ink"
                  words={["clock off.", "sign out.", "log off.", "switch off.", "go home."]}
                />
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <SignInButton magnetic withIcon className="btn-primary">
                  Start punching out on time
                </SignInButton>
                <a href="#how" className="btn-ghost">
                  See how it works
                </a>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ash">
                <span className="inline-flex items-center gap-1.5">
                  <Dot /> Free to use
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Dot /> Email + push reminders
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Dot /> We never watch you work
                </span>
              </p>
            </Reveal>
          </div>

          {/* product surface */}
          <Reveal delay={200} className="lg:pl-4">
            <Tilt className="animate-float-slow" max={7}>
              <CommandPalette />
            </Tilt>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-stone" />;
}
