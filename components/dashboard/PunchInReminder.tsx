"use client";

import { useCallback, useEffect, useState } from "react";
import { TimeWheel } from "./TimeWheel";
import { useToast } from "./Toast";

function label(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function PunchInReminder() {
  const toast = useToast();
  const [enabled, setEnabled] = useState(false);
  const [savedTime, setSavedTime] = useState("09:30");
  const [time, setTime] = useState("09:30");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/reminders/daily", { cache: "no-store" });
        if (res.ok) {
          const d = await res.json();
          setEnabled(Boolean(d.enabled));
          setSavedTime(d.time ?? "09:30");
          setTime(d.time ?? "09:30");
        }
      } catch {
        /* fall back to defaults */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = useCallback(
    async (nextEnabled: boolean, nextTime: string) => {
      setBusy(true);
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      try {
        const res = await fetch("/api/reminders/daily", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: nextEnabled, time: nextTime, timeZone }),
        });
        if (!res.ok) throw new Error();
        setEnabled(nextEnabled);
        setSavedTime(nextTime);
        setTime(nextTime);
        setEditing(false);
        toast({
          kind: nextEnabled ? "success" : "info",
          text: nextEnabled
            ? `Daily punch-in reminder on for ${label(nextTime)}.`
            : "Daily punch-in reminder turned off.",
        });
      } catch {
        toast({ kind: "error", text: "Couldn't update the reminder. Try again." });
      } finally {
        setBusy(false);
      }
    },
    [toast]
  );

  if (loading) {
    return <div className="mt-6 h-[88px] animate-pulse rounded-xl border border-hairline bg-surface" />;
  }

  return (
    <div className="mt-6 rounded-xl border border-hairline bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Daily punch-in reminder</h2>
          <p className="mt-1 text-[13px] text-mute">
            {enabled ? (
              <>
                On — we&apos;ll nudge you at{" "}
                <span className="font-semibold text-ink">{label(savedTime)}</span> every day.
              </>
            ) : (
              "Off — flip it on to get a daily nudge to clock in."
            )}
          </p>
        </div>
        <Switch
          checked={enabled}
          disabled={busy}
          onChange={(v) => save(v, savedTime)}
          ariaLabel="Toggle daily punch-in reminder"
        />
      </div>

      {enabled && (
        <div className="mt-5 border-t border-hairline pt-5">
          {editing ? (
            <>
              <p className="text-[12px] text-ash">Pick a time</p>
              <div className="mt-2 rounded-lg border border-hairline bg-surface-elevated px-2 py-1.5">
                <TimeWheel value={time} onChange={setTime} />
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => save(true, time)}
                  disabled={busy}
                  className="btn-primary disabled:opacity-60"
                >
                  {busy ? "Saving…" : "Save time"}
                </button>
                <button
                  onClick={() => {
                    setTime(savedTime);
                    setEditing(false);
                  }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-ash">Reminder time</p>
                <p className="tabular mt-0.5 text-[20px] font-semibold text-ink">{label(savedTime)}</p>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="btn-ghost !h-9 !px-3.5 !text-[13px]"
              >
                Change time
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  disabled,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
        checked ? "bg-accent-green" : "bg-stone"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
