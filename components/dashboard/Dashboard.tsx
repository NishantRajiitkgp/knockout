"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PunchSession } from "@/lib/supabase";
import { formatClock, formatDay, formatDuration, formatLongDate, isNextDay } from "@/lib/time";
import { fireConfetti } from "@/lib/confetti";
import { EnableReminders } from "./EnableReminders";
import { Diagnostics } from "./Diagnostics";
import { ToastProvider, useToast } from "./Toast";
import { TimeWheel } from "./TimeWheel";

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

  const removeLog = useCallback(
    async (id: string) => {
      const prev = recent;
      setRecent((r) => r.filter((s) => s.id !== id)); // optimistic
      try {
        const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Could not delete");
        toast({ kind: "info", text: "Log deleted." });
      } catch (e) {
        setRecent(prev); // rollback
        toast({ kind: "error", text: e instanceof Error ? e.message : "Could not delete" });
      }
    },
    [recent, toast]
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12.5px] font-medium uppercase tracking-wide text-ash">
            {formatLongDate()}
          </p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tightish text-ink">
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

      <History sessions={recent} onDelete={removeLog} />

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
        <div>
          <span className="text-[13px] font-medium text-body">I punched in at</span>
          <div className="mt-2 rounded-lg border border-hairline bg-surface-elevated px-2 py-1.5">
            <TimeWheel value={time} onChange={setTime} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-medium text-body">Working hours</span>
            <span className="tabular text-[15px] font-semibold text-ink">
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

function fmtHours(h: number): string {
  return h.toFixed(2).replace(/\.?0+$/, "");
}

function clampHours(n: number): number {
  if (Number.isNaN(n)) return 1;
  return Math.min(24, Math.max(1, +n.toFixed(2)));
}

function HoursStepper({
  hours,
  setHours,
}: {
  hours: number;
  setHours: React.Dispatch<React.SetStateAction<number>>;
}) {
  // Local text state so the user can freely type (e.g. "8.", "8.5") before commit.
  const [text, setText] = useState(() => fmtHours(hours));

  useEffect(() => {
    setText(fmtHours(hours));
  }, [hours]);

  function commit() {
    const n = parseFloat(text);
    if (Number.isNaN(n)) {
      setText(fmtHours(hours));
      return;
    }
    setHours(clampHours(n));
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <Stepper label="Decrease hours" onClick={() => setHours((h) => Math.max(1, +(h - 0.5).toFixed(2)))}>
        &minus;
      </Stepper>
      <div className="flex flex-1 items-center justify-center gap-1 rounded-md border border-hairline bg-surface-elevated py-2.5 transition-colors focus-within:border-hairline-strong">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^\d.]/g, ""))}
          onBlur={commit}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          inputMode="decimal"
          aria-label="Working hours, edit by typing"
          className="w-14 bg-transparent text-right tabular text-[16px] font-semibold text-ink outline-none"
        />
        <span className="text-[14px] text-mute">h</span>
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
  const celebrated = useRef(false);

  const remindMs = new Date(session.remind_at).getTime();
  const OVERDUE_CAP_S = 15 * 60; // stop counting after 15 min — task's done, no need to burn cycles

  // Tick every second, but stop the timer once we're 15 min overdue.
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t - remindMs >= OVERDUE_CAP_S * 1000) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [remindMs, OVERDUE_CAP_S]);

  const diff = Math.round((remindMs - now) / 1000);
  const fired = diff <= 0;
  const overdueS = fired ? Math.abs(diff) : 0;
  const capped = overdueS >= OVERDUE_CAP_S;
  const shownS = fired ? Math.min(overdueS, OVERDUE_CAP_S) : Math.abs(diff);
  const countdown = `${Math.floor(shownS / 3600)}h ${String(Math.floor((shownS % 3600) / 60)).padStart(2, "0")}m ${String(shownS % 60).padStart(2, "0")}s`;

  // Celebrate the moment the day is done — live if on screen, or on next open
  // if it already passed. Once per session (persisted), so reopening is calm.
  useEffect(() => {
    if (!fired || celebrated.current) return;
    const key = `knockout_celebrated_${session.id}`;
    try {
      if (localStorage.getItem(key)) {
        celebrated.current = true;
        return;
      }
      localStorage.setItem(key, "1");
    } catch {
      /* private mode / storage disabled — still celebrate this once */
    }
    celebrated.current = true;
    fireConfetti();
  }, [fired, session.id]);

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
          <p className="tabular mt-0.5 text-[22px] font-medium text-ink">
            {countdown}
            {capped && <span className="text-ash">+</span>}
          </p>
          {capped && (
            <p className="mt-1 text-[11.5px] text-ash">
              Counter paused — just punch out whenever you get to it.
            </p>
          )}
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
function History({
  sessions,
  onDelete,
}: {
  sessions: PunchSession[];
  onDelete: (id: string) => Promise<void>;
}) {
  if (sessions.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[14px] font-semibold text-ink">Recent days</h2>
        <span className="text-[12px] text-ash">{sessions.length} logged</span>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {sessions.map((s) => (
          <HistoryRow key={s.id} session={s} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
}

function HistoryRow({
  session: s,
  onDelete,
}: {
  session: PunchSession;
  onDelete: (id: string) => Promise<void>;
}) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const tz = s.time_zone;
  const worked = s.punched_out_at
    ? Math.round((new Date(s.punched_out_at).getTime() - new Date(s.punch_in_at).getTime()) / 60_000)
    : null;

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface px-4 py-3">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-ink">{formatDay(s.punch_in_at, tz)}</p>
        <p className="mt-1 flex items-center gap-2 text-[12.5px] text-mute">
          <span className="tabular">{formatClock(s.punch_in_at, tz)}</span>
          <span className="text-stone">→</span>
          <span className="tabular">
            {s.punched_out_at ? formatClock(s.punched_out_at, tz) : "—"}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {worked != null ? (
          <div className="text-right">
            <p className="tabular text-[14px] font-semibold text-ink">
              {formatDuration(Math.max(0, worked))}
            </p>
            <p className="text-[11.5px] text-ash">worked</p>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-yellow/30 bg-accent-yellow/10 px-2.5 py-1 text-[11.5px] font-medium text-accent-yellow">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-yellow" />
            No punch-out
          </span>
        )}

        {confirm ? (
          <span className="inline-flex items-center gap-2 text-[12px]">
            <button
              onClick={async () => {
                setBusy(true);
                await onDelete(s.id);
              }}
              disabled={busy}
              className="font-medium text-accent-red transition-colors hover:text-accent-red/80 disabled:opacity-60"
            >
              {busy ? "Deleting…" : "Delete"}
            </button>
            <span className="text-stone">·</span>
            <button
              onClick={() => setConfirm(false)}
              disabled={busy}
              className="text-mute transition-colors hover:text-ink"
            >
              keep
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            aria-label="Delete this log"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ash transition-colors hover:bg-surface-elevated hover:text-accent-red"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </li>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a1 1 0 01-1 1H7a1 1 0 01-1-1V7M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkeletonCard() {
  return <div className="h-48 animate-pulse rounded-xl border border-hairline bg-surface" />;
}
