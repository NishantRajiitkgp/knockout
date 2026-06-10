import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignInButton } from "@/components/auth/SignInButton";

const links = [
  { label: "The problem", href: "#problem" },
  { label: "How it works", href: "#how" },
  { label: "Why it's different", href: "#features" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline/70 bg-canvas/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Knockout home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-mute transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <SignInButton className="hidden text-[13px] font-medium text-mute transition-colors hover:text-ink sm:inline-flex">
            Sign in
          </SignInButton>
          <SignInButton className="btn-primary !h-9 !px-4 !text-[13px]">
            Get started
          </SignInButton>
        </div>
      </div>
    </header>
  );
}
