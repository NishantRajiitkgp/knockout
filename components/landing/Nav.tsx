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
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <header className="flex h-14 w-full max-w-content items-center justify-between rounded-full border border-white/[0.12] bg-surface/30 bg-gradient-to-b from-white/[0.04] to-transparent px-5 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl sm:px-6">
        <Link href="/" aria-label="Knockout home" className="transition-opacity hover:opacity-80">
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
          <SignInButton className="btn-primary !h-9 !rounded-full !px-4 !text-[13px]">
            Get started
          </SignInButton>
        </div>
      </header>
    </div>
  );
}
