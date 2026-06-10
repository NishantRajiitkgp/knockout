"use client";

import { useCallback, useEffect, useState } from "react";

type Health = {
  google: boolean;
  supabase: boolean;
  email: boolean;
  push: boolean;
  qstash: boolean;
};

const LABELS: { key: keyof Health; label: string }[] = [
  { key: "supabase", label: "Database" },
  { key: "email", label: "Email" },
  { key: "push", label: "Push" },
  { key: "qstash", label: "Scheduling" },
];

export function Diagnostics() {
  const [health, setHealth] = useState<Health | null>(null);
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const loadHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (res.ok) setHealth(await res.json());
    } catch {
      /* non-critical */
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  async function sendTest() {
    setTesting(true);
    setResult(null);
    try {
      const res = await fetch("/api/reminders/test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Test failed");
      const bits: string[] = [];
      bits.push(data.emailSent ? "email sent" : "email skipped (no SMTP)");
      bits.push(`${data.pushSent ?? 0} push sent`);
      setResult({ kind: "ok", text: `Test reminder: ${bits.join(" · ")}` });
    } catch (e) {
      setResult({ kind: "err", text: e instanceof Error ? e.message : "Test failed" });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="mt-12 rounded-lg border border-hairline bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[13px] font-medium text-mute">Setup &amp; diagnostics</span>
        <span className="flex items-center gap-3">
          {health && (
            <span className="hidden items-center gap-1.5 sm:flex">
              {LABELS.map(({ key, label }) => (
                <Badge key={key} on={health[key]} label={label} />
              ))}
            </span>
          )}
          <Chevron open={open} />
        </span>
      </button>

      {open && (
        <div className="border-t border-hairline px-4 py-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:hidden">
            {health &&
              LABELS.map(({ key, label }) => <Badge key={key} on={health[key]} label={label} />)}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 sm:mt-0">
            <p className="max-w-md text-[12.5px] leading-relaxed text-ash">
              Send yourself a reminder right now to verify email + push. This skips the
              schedule, so it works on localhost where QStash can&apos;t reach you.
            </p>
            <button
              onClick={sendTest}
              disabled={testing}
              className="btn-ghost !h-9 !px-3.5 !text-[13px] disabled:opacity-60"
            >
              {testing ? "Sending…" : "Send test reminder"}
            </button>
          </div>

          {result && (
            <p
              className={`mt-3 text-[12.5px] ${
                result.kind === "ok" ? "text-accent-green" : "text-accent-red"
              }`}
            >
              {result.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-1 text-[11.5px] text-mute"
      title={on ? `${label}: configured` : `${label}: not configured`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-accent-green" : "bg-stone"}`} />
      {label}
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-4 w-4 text-ash transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
