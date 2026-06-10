import { CommandPalette } from "./CommandPalette";
import { Reveal } from "./Reveal";
import { Aurora } from "@/components/fx/Aurora";
import { Tilt } from "@/components/fx/Tilt";
import { RotatingWord } from "@/components/fx/RotatingWord";
import { ScrambleText } from "@/components/fx/ScrambleText";
import { SignInButton } from "@/components/auth/SignInButton";

function StripeBand() {
  return (
    <div className="stripe-band animate-stripe-drift" aria-hidden="true">
      <div className="stripe-bar left-[25%] opacity-90" />
      <div className="stripe-bar left-[45%] opacity-70" style={{ width: "12%" }} />
      <div className="stripe-bar left-[65%] opacity-50" style={{ width: "9%" }} />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-start overflow-hidden pt-32 sm:pt-40">
      <StripeBand />
      <Aurora className="absolute inset-0 -z-10 opacity-80 mix-blend-screen" />
      
      {/* Deep radial mask for the background grid so it fades out at edges */}
      <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      {/* Radial glow right behind the text */}
      <div className="pointer-events-none absolute left-1/2 top-[20%] -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-accent-red/20 blur-[120px]" />

      <div className="relative z-10 mx-auto flex max-w-content flex-col items-center px-5 text-center sm:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-1.5 text-[13px] font-medium text-ink shadow-[0_0_20px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-red opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-red"></span>
            </span>
            For everyone still secretly &ldquo;clocked in&rdquo;
          </span>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="mt-8 text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.88] tracking-[-0.04em]">
            <span className="block text-mute/80">Your body went home.</span>
            <span className="block bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] mt-2">
              <ScrambleText text="Your timesheet didn't." duration={1200} />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-8 max-w-2xl text-[clamp(16px,2vw,20px)] leading-relaxed text-body sm:mt-10">
            You never forget to show up. It&apos;s leaving that slips your
            mind &mdash; until 11&nbsp;PM, in bed, when it hits you:
            <span className="font-medium text-ink"> you never punched out.</span> Knockout
            watches the clock so you can finally{" "}
            <RotatingWord
              className="font-semibold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
              words={["clock off.", "sign out.", "log off.", "switch off.", "go home."]}
            />
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <SignInButton magnetic withIcon className="btn-primary !h-14 !rounded-full !px-8 !text-[16px] shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.8)]">
              Start punching out on time
            </SignInButton>
            <a href="#how" className="btn-ghost !h-14 !rounded-full !px-8 !text-[16px] backdrop-blur-md">
              See how it works
            </a>
          </div>
        </Reveal>
      </div>

      {/* Massive 3D Hero Asset */}
      <Reveal delay={400} className="relative z-20 mt-20 w-full max-w-5xl px-5 sm:mt-28 sm:px-8">
        <div className="relative mx-auto w-full" style={{ perspective: "2000px" }}>
          {/* The tilt wrapper handles the mouse interaction, but we give it a default 3D rotation so it looks like it's laying back slightly */}
          <Tilt className="animate-float-slow" max={8}>
            <div 
              className="relative w-full transition-transform duration-1000 ease-out"
              style={{ transform: "rotateX(8deg) scale(1.02)" }}
            >
              <CommandPalette />
            </div>
          </Tilt>
        </div>
        
        {/* Gradient fade at the bottom to blend into the next section */}
        <div className="pointer-events-none absolute -bottom-10 left-0 right-0 z-30 h-40 bg-gradient-to-t from-canvas to-transparent" />
      </Reveal>
    </section>
  );
}
