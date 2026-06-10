import Link from "next/link";
import { Logo } from "@/components/Logo";

export function LegalShell({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen">
      <header className="sticky top-0 z-50 border-b border-hairline/70 bg-canvas/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link href="/" aria-label="Knockout home" className="transition-opacity hover:opacity-80">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-[13px] text-mute transition-colors hover:text-ink"
          >
            &larr; Back home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        <p className="text-[12.5px] font-medium uppercase tracking-wide text-ash">Legal</p>
        <h1 className="mt-2 text-[34px] font-semibold tracking-tightish text-ink sm:text-[40px]">
          {title}
        </h1>
        <p className="mt-3 text-[13px] text-ash">Last updated: {updated}</p>
        <p className="mt-7 text-[16px] leading-relaxed text-body">{intro}</p>

        <div className="mt-12 flex flex-col gap-10">{children}</div>

        <div className="mt-16">
          <div className="rule-fade" />
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            <Link href="/privacy" className="text-mute transition-colors hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="text-mute transition-colors hover:text-ink">
              Terms
            </Link>
            <Link href="/" className="text-mute transition-colors hover:text-ink">
              Home
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[20px] font-semibold tracking-tightish text-ink">{heading}</h2>
      <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-body">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2 pl-1">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-red" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
