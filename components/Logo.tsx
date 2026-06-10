import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  /** Render only the mark, without the wordmark. */
  markOnly?: boolean;
  /** Wrap the mark in a Raycast-style app-icon tile. */
  tile?: boolean;
  size?: number;
};

/**
 * Knockout logo.
 * The mark is a monoline "K" whose upper arm is tipped with a dot — at once a
 * letter K and a clock hand pointing past the end of the day. Minimal, mono,
 * classy; the accent dot is the only spark of color.
 */
export function KnockoutMark({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth={2.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 3.6V20.4" />
        <path d="M7 12.4 16.4 4.6" />
        <path d="M7 11.6 16.8 20" />
      </g>
      <circle cx="18.4" cy="4.3" r="1.85" fill="#ff6161" />
    </svg>
  );
}

export function Logo({ className, markOnly, tile, size = 22 }: LogoProps) {
  const mark = tile ? (
    <span
      className="inline-flex items-center justify-center rounded-md border border-hairline bg-gradient-to-b from-surface-card to-surface text-ink"
      style={{ width: size + 16, height: size + 16 }}
    >
      <KnockoutMark size={size} className="text-ink" />
    </span>
  ) : (
    <KnockoutMark size={size} className="text-ink" />
  );

  if (markOnly) {
    return <span className={cn("inline-flex", className)}>{mark}</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {mark}
      <span className="text-[17px] font-semibold tracking-tightish text-ink">
        Knock<span className="text-mute">out</span>
      </span>
    </span>
  );
}
