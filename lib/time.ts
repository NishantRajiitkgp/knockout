export const DEFAULT_WORKING_MINUTES = 510; // 8h 30m

/** punch_in + working_minutes → reminder timestamp (ISO). */
export function computeRemindAt(punchInAt: string, workingMinutes: number): string {
  return new Date(new Date(punchInAt).getTime() + workingMinutes * 60_000).toISOString();
}

/** "8h 30m" from minutes. */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

/**
 * Wall-clock time like "5:32 PM". Pass an IANA `timeZone` (e.g.
 * "Asia/Kolkata") to format in the user's zone — important server-side
 * (email/push) where the runtime is usually UTC.
 */
export function formatClock(iso: string, timeZone?: string | null): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
}

function calendarDay(iso: string | number | Date, timeZone?: string | null): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
}

/** Friendly day label: "Today", "Yesterday", or "Wed, Jun 10". */
export function formatDay(iso: string, timeZone?: string | null): string {
  const target = calendarDay(iso, timeZone);
  const now = Date.now();
  if (target === calendarDay(now, timeZone)) return "Today";
  if (target === calendarDay(now - 86_400_000, timeZone)) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(timeZone ? { timeZone } : {}),
  });
}

/** Long date for headers: "Wednesday, Jun 10". */
export function formatLongDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** True when remind_at lands on a different calendar day than punch_in. */
export function isNextDay(
  punchInIso: string,
  remindIso: string,
  timeZone?: string | null
): boolean {
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  };
  // en-CA renders as YYYY-MM-DD, so string compare = calendar-day compare.
  const a = new Date(punchInIso).toLocaleDateString("en-CA", opts);
  const b = new Date(remindIso).toLocaleDateString("en-CA", opts);
  return a !== b;
}
