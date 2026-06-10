import { Client, Receiver } from "@upstash/qstash";

let client: Client | null = null;

function getClient(): Client | null {
  const token = process.env.QSTASH_TOKEN;
  if (!token) return null;
  if (client) return client;
  client = new Client({ token });
  return client;
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Schedule a one-shot delayed message that POSTs /api/reminders/fire at
 * `remindAt`. Returns the QStash messageId, or null when QStash isn't
 * configured (local dev) — the app stays usable, just without the reminder.
 *
 * Note: QStash can't reach `localhost`; use a public URL (or a tunnel) to
 * test real delivery.
 */
export async function scheduleReminder(
  sessionId: string,
  remindAtIso: string
): Promise<string | null> {
  const c = getClient();
  if (!c) {
    console.warn("[qstash] QSTASH_TOKEN not set — reminder not scheduled.");
    return null;
  }

  const notBefore = Math.floor(new Date(remindAtIso).getTime() / 1000);
  const res = await c.publishJSON({
    url: `${appUrl()}/api/reminders/fire`,
    body: { sessionId },
    notBefore,
    retries: 3,
  });
  return res.messageId ?? null;
}

/** Cancel a previously scheduled reminder. Safe to call with null. */
export async function cancelReminder(messageId: string | null): Promise<void> {
  if (!messageId) return;
  const c = getClient();
  if (!c) return;
  try {
    await c.messages.delete(messageId);
  } catch (err) {
    // Already delivered/expired messages 404 — not an error for us.
    console.warn("[qstash] cancel failed (likely already fired):", err);
  }
}

/**
 * Create a recurring daily schedule that POSTs `path` at `cron` (UTC) with
 * the given JSON body. Returns the scheduleId, or null when QStash isn't set.
 */
export async function createDailySchedule(
  path: string,
  cron: string,
  body: unknown
): Promise<string | null> {
  const c = getClient();
  if (!c) {
    console.warn("[qstash] QSTASH_TOKEN not set — schedule not created.");
    return null;
  }
  const res = await c.schedules.create({
    destination: `${appUrl()}${path}`,
    cron,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  return res.scheduleId ?? null;
}

/** Delete a recurring schedule. Safe to call with null. */
export async function deleteSchedule(scheduleId: string | null): Promise<void> {
  if (!scheduleId) return;
  const c = getClient();
  if (!c) return;
  try {
    await c.schedules.delete(scheduleId);
  } catch (err) {
    console.warn("[qstash] delete schedule failed:", err);
  }
}

/** Verify a QStash callback signature. In dev (no keys) it accepts. */
export async function verifyQstashSignature(
  signature: string | null,
  body: string
): Promise<boolean> {
  const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const next = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!current || !next) {
    console.warn("[qstash] signing keys not set — skipping verification.");
    return true;
  }
  if (!signature) return false;
  try {
    const receiver = new Receiver({ currentSigningKey: current, nextSigningKey: next });
    return await receiver.verify({ signature, body });
  } catch (err) {
    console.error("[qstash] signature verify failed:", err);
    return false;
  }
}
