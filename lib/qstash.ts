import { Client } from "@upstash/qstash";

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
