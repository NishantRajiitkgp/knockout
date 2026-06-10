"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PunchSession } from "@/lib/supabase";
import { formatClock, formatDuration, isNextDay } from "@/lib/time";
import { EnableReminders } from "./EnableReminders";
import { Diagnostics } from "./Diagnostics";
import { ToastProvider, useToast } from "./Toast";

function nowTimeStr(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function timeStrToISO(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

export function Dashboard({ userName }: { userName: string | null }) {
  return (
    <ToastProvider>
      <DashboardInner userName={userName} />
    </ToastProvider>
  );
}

function DashboardInner({ userName }: { userName: string | null }) {
  const toast = useToast();
  const [active, setActive] = useState<PunchSession | null>(null);
  const [recent, setRecent] = useState<PunchSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActive(data.active ?? null);
      setRecent(data.recent ?? []);
    } catch {
      toast({ kind: "error", text: "Couldn't load your sessions. Try refreshing." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  /* ── mutations (parent-owned so we can update optimistically) ── */

  const punchIn = useCallback(
    async (punchInAt: string, workingMinutes: number): Promise<boolean> => {
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ punchInAt, workingMinutes, timeZone }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Could not punch in");
        setActive(data.session);
        toast({
          kind: "success",
          text: `Punched in. We'll knock you out at ${formatClock(data.session.remind_at)}.`,
        });
        load();
        return true;
      } catch (e) {
        toast({ kind: "error", text: e instanceof Error ? e.message : "Could not punch in" });
        return false;
      }
    },
    [load, toast]
  );

  const punchOut = useCallback(async () => {
    if (!active) return;
    const prev = active;
    setActive(null); // optimistic
    try {
      const res = await fetch(`/api/sessions/${prev.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "punch_out" }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Punch out failed");
      }
      toast({ kind: "success", text: "Punched out. Go home — you're off the clock." });
      load();
    } catch (e) {
      setActive(prev); // rollback
      toast({ kind: "error", text: e instanceof Error ? e.message : "Punch out failed" });
    }
  }, [active, load, toast]);

  const adjust = useCallback(
    async (workingMinutes: number): Promise<boolean> => {
      if (!active) return false;
      try {
        const res = await fetch(`/api/sessions/${active.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "adjust", workingMinutes }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Could not update hours");
        setActive(data.session);
        toast({
          kind: "success",
          text: `Hours updated. New punch-out at ${formatClock(data.session.remind_at)}.`,
        });
        return true;
      } catch (e) {
        toast({ kind: "error", text: e instanceof Error ? e.message : "Could not update hours" });
        return false;
      }
    },
    [active, toast]
  );

  const cancel = useCallback(async () => {
    if (!active) return;
    const prev = active;
    setActive(null); // optimistic
    try {
      const res = await fetch(`/api/sessions/${prev.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not cancel");
      toast({ kind: "info", text: "Session cancelled. Reminder called off." });
    } catch (e) {
      setActive(prev); // rollback
      toast({ kind: "error", text: e instanceof Error ? e.message : "Could not cancel" });
    }
  }, [active, toast]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tightish text-ink">
            {greeting()}
            {userName ? `, ${userName.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-1.5 text-[14px] text-mute">
            {active
              ? "You're on the clock. We've got your punch-out."
              : "Punch in and we'll handle the leaving."}
          </p>
        </div>
        <EnableReminders />
      </div>

      <div className="mt-8">
        {loading ? (
          <SkeletonCard />
        ) : active ? (
          <ActiveSessionCard
            session={active}
            onPunchOut={punchOut}
            onAdjust={adjust}
            onCancel={cancel}
          />
        ) : (
          <PunchInCard onPunchIn={punchIn} />
        )}
      </div>

      <History sessions={recent} />

      <Diagnostics />
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/* ── Punch in ─────────────────────────────────────────────── */
function PunchInCard({
  onPunchIn,
}: {
  onPunchIn: (punchInAt: string, workingMinutes: number) => Promise<boolean>;
}) {
  const [time, setTime] = useState(nowTimeStr());
  const [hours, setHours] = useState(8.5);
  const [busy, setBusy] = useState(false);

  const { outLabel, nextDay, past } = useMemo(() => {
    const inIso = timeStrToISO(time);
    const outMs = new Date(inIso).getTime() + hours * 3600_000;
    const outIso = new Date(outMs).toISOString();
    return {
      outLabel: formatClock(outIso),
      nextDay: isNextDay(inIso, outIso),
      past: outMs <= Date.now(),
    };
  }, [time, hours]);

  async function submit() {
    setBusy(true);
    await onPunchIn(timeStrToISO(time), Math.round(hours * 60));
    setBusy(false);
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface p-6 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="text-[13px] text-mute">I punched in at</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-2 w-full rounded-md border border-hairline bg-surface-elevated px-3 py-2.5 text-[18px] text-ink outline-none transition-colors focus:border-hairline-strong [color-scheme:dark]"
          />
        </label>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-mute">Working hours</span>
            <span className="tabular text-[15px] font-medium text-ink">
              {formatDuration(Math.round(hours * 60))}
            </span>
          </div>
          <HoursStepper hours={hours} setHours={setHours} />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
        <p className="text-[13px] text-mute">
          We&apos;ll knock you out at{" "}
          <span className="tabular font-medium text-ink">{outLabel}</span>
          {nextDay && <span className="ml-1 text-ash">(next day)</span>}
        </p>
        <button onClick={submit} disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? "Punching in…" : "Punch in"}
        </button>
      </div>

      {past && (
        <p className="mt-3 inline-flex items-center gap-2 text-[12.5px] text-accent-yellow">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-yellow" />
          That punch-out time has already passed — we&apos;ll remind you as soon as you punch in.
        </p>
      )}
    </div>
  );
}

function HoursStepper({
  hours,
  setHours,
}: {
  hours: number;
  setHours: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <Stepper label="Decrease hours" onClick={() => setHours((h) => Math.max(1, +(h - 0.5).toFixed(2)))}>
        &minus;
      </Stepper>
      <div className="flex-1 rounded-md border border-hairline bg-surface-elevated py-2.5 text-center tabular text-[16px] text-ink">
        {hours.toFixed(2).replace(/\.00$/, "")} h
      </div>
      <Stepper label="Increase hours" onClick={() => setHours((h) => Math.min(24, +(h + 0.5).toFixed(2)))}>
        +
      </Stepper>
    </div>
  );
}

function Stepper({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-md border border-hairline bg-surface-elevated text-[18px] text-ink transition-colors hover:border-hairline-strong hover:bg-surface-card"
    >
      {children}
    </button>
  );
}

/* ── Active session ───────────────────────────────────────── */
function ActiveSessionCard({
  session,
  onPunchOut,
  onAdjust,
  onCancel,
}: {
  session: PunchSession;
  onPunchOut: () => Promise<void>;
  onAdjust: (workingMinutes: number) => Promise<boolean>;
  onCancel: () => Promise<void>;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [hours, setHours] = useState(session.working_minutes / 60);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remindMs = new Date(session.remind_at).getTime();
  const diff = Math.round((remindMs - now) / 1000);
  const fired = diff <= 0;
  const abs = Math.abs(diff);
  const countdown = `${Math.floor(abs / 3600)}h ${String(Math.floor((abs % 3600) / 60)).padStart(2, "0")}m ${String(abs % 60).padStart(2, "0")}s`;

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    await fn();
    setBusy(false);
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-surface p-6 sm:p-8">
      <div className="palette-glow pointer-events-none absolute inset-x-0 top-0 h-40" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-elevated px-3 py-1 text-[12px] text-mute">
            <span
              className={`h-1.5 w-1.5 rounded-full ${fired ? "bg-accent-red" : "animate-pulse-dot bg-accent-green"}`}
            />
            {fired ? "Time's up — punch out" : "On the clock"}
          </span>
          <span className="tabular text-[12px] text-ash">In at {formatClock(session.punch_in_at)}</span>
        </div>

        <p className="mt-6 text-[13px] text-mute">
          {fired ? "You should have clocked out at" : "We'll knock you out at"}
        </p>
        <p className="tabular mt-1 text-display-lg font-semibold text-ink">
          {formatClock(session.remind_at)}
          {isNextDay(session.punch_in_at, session.remind_at) && (
            <span className="ml-2 align-middle text-[14px] font-normal text-ash">next day</span>
          )}
        </p>

        <div className="mt-5 rounded-lg border border-hairline bg-surface-elevated px-5 py-4">
          <p className="text-[12px] text-ash">{fired ? "Overdue by" : "Counting down"}</p>
          <p className="tabular mt-0.5 text-[22px] font-medium text-ink">{countdown}</p>
        </div>

        {adjusting ? (
          <div className="mt-6 border-t border-hairline pt-6">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-mute">New working hours</span>
              <span className="tabular text-[15px] font-medium text-ink">
                {formatDuration(Math.round(hours * 60))}
              </span>
            </div>
            <HoursStepper hours={hours} setHours={setHours} />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  run(async () => {
                    const ok = await onAdjust(Math.round(hours * 60));
                    if (ok) setAdjusting(false);
                  })
                }
                disabled={busy}
                className="btn-primary disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save hours"}
              </button>
              <button onClick={() => setAdjusting(false)} className="btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-hairline pt-6">
            <button
              onClick={() => run(onPunchOut)}
              disabled={busy}
              className="btn-primary disabled:opacity-60"
            >
              {busy ? "…" : "Punch out"}
            </button>
            <button onClick={() => setAdjusting(true)} disabled={busy} className="btn-ghost">
              Adjust hours
            </button>

            {confirmCancel ? (
              <span className="inline-flex items-center gap-2 text-[13px] text-mute">
                Cancel session?
                <button
                  onClick={() => run(onCancel)}
                  disabled={busy}
                  className="font-medium text-accent-red transition-colors hover:text-accent-red/80"
                >
                  Yes, cancel
                </button>
                <span className="text-stone">·</span>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="text-mute transition-colors hover:text-ink"
                >
                  keep
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmCancel(true)}
                disabled={busy}
                className="ml-auto text-[13px] text-ash transition-colors hover:text-accent-red"
              >
                Cancel session
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── History ──────────────────────────────────────────────── */
function History({ sessions }: { sessions: PunchSession[] }) {
  if (sessions.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-[13px] font-medium text-mute">Recent days</h2>
      <ul className="mt-3 overflow-hidden rounded-lg border border-hairline">
        {sessions.map((s, i) => (
          <li
            key={s.id}
            className={`flex items-center justify-between gap-4 bg-surface px-4 py-3 ${i > 0 ? "border-t border-hairline" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span className="keycap tabular">{formatClock(s.punch_in_at)}</span>
              <span className="text-ash">→</span>
              <span className="keycap tabular">
                {s.punched_out_at ? formatClock(s.punched_out_at) : "—"}
              </span>
            </div>
            <span className="text-[12.5px] text-ash">{formatDuration(s.working_minutes)} planned</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-48 animate-pulse rounded-xl border border-hairline bg-surface" />;
}
