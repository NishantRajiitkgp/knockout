import { Logo } from "@/components/Logo";
import { Reveal } from "./Reveal";
import { SignInButton } from "@/components/auth/SignInButton";

export function ClosingCTA() {
  return (
    <section className="relative scroll-mt-20 border-t border-hairline">
      <div className="mx-auto max-w-content px-5 py-28 sm:px-8 sm:py-36">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-display-lg font-semibold text-ink">
            Go home knowing
            <br />
            the clock already did.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[16px] leading-relaxed text-body">
            Clock in with your hands. Let Knockout handle the leaving. The next
            time the day ends, you&apos;ll already be out.
          </p>
          <div className="mt-9 flex justify-center">
            <SignInButton magnetic withIcon className="btn-primary">
              Start punching out on time
            </SignInButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, #ff5757 30%, #a1131a 60%, transparent)",
          opacity: 0.5,
        }}
        aria-hidden="true"
      />
      <div className="mx-auto flex max-w-content flex-col gap-8 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ash">
            A quiet nudge at the end of the day. We don&apos;t watch you work —
            we just walk you out.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 text-[13px] sm:items-end">
          <a href="#problem" className="text-mute transition-colors hover:text-ink">
            The problem
          </a>
          <a href="#how" className="text-mute transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#features" className="text-mute transition-colors hover:text-ink">
            Why it&apos;s different
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-content px-5 pb-10 sm:px-8">
        <div className="rule-fade" />
        <p className="mt-6 text-[12px] text-stone">
          © {new Date().getFullYear()} Knockout. Built for everyone who keeps
          forgetting to leave.
        </p>
      </div>
    </footer>
  );
}
