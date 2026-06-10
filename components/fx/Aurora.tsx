import { cn } from "@/lib/cn";

/** Soft drifting color fields behind the hero. Pure CSS, respects reduced motion. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <div
        className="aurora-blob animate-aurora-1 left-[8%] top-[-6%] h-[42vw] w-[42vw] max-h-[560px] max-w-[560px]"
        style={{ background: "radial-gradient(circle, rgba(255,87,87,0.22), transparent 60%)" }}
      />
      <div
        className="aurora-blob animate-aurora-2 right-[2%] top-[6%] h-[38vw] w-[38vw] max-h-[520px] max-w-[520px]"
        style={{ background: "radial-gradient(circle, rgba(161,19,26,0.20), transparent 62%)" }}
      />
      <div
        className="aurora-blob animate-aurora-1 left-[36%] top-[28%] h-[30vw] w-[30vw] max-h-[420px] max-w-[420px]"
        style={{ background: "radial-gradient(circle, rgba(87,193,255,0.08), transparent 60%)" }}
      />
    </div>
  );
}
