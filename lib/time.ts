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

/** "9:30 AM" from a local "HH:MM" string. */
export function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Minutes a timezone is ahead of UTC at the given date (IST → +330). */
export function tzOffsetMinutes(timeZone: string, date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  let hour = Number(map.hour);
  if (hour === 24) hour = 0;
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second)
  );
  return Math.round((asUTC - date.getTime()) / 60_000);
}

/** Convert a local "HH:MM" in `timeZone` to a daily UTC cron "m h * * *". */
export function dailyCronUtc(time: string, timeZone: string | null): string {
  const [h, m] = time.split(":").map(Number);
  const offset = timeZone ? tzOffsetMinutes(timeZone) : 0;
  let total = (h || 0) * 60 + (m || 0) - offset; // local → UTC
  total = ((total % 1440) + 1440) % 1440;
  return `${total % 60} ${Math.floor(total / 60)} * * *`;
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
