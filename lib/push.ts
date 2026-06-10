import webpush from "web-push";
import type { PushSubscriptionRow } from "./supabase";

let configured = false;

function configure(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  if (configured) return true;

  const contact = process.env.GMAIL_USER
    ? `mailto:${process.env.GMAIL_USER}`
    : "mailto:hello@knockout.app";
  webpush.setVapidDetails(contact, publicKey, privateKey);
  configured = true;
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

/**
 * Sends a push to one subscription. Returns false on the "gone" codes
 * (404/410) so callers can prune dead subscriptions.
 */
export async function sendPush(
  sub: PushSubscriptionRow,
  payload: PushPayload
): Promise<{ ok: boolean; gone: boolean }> {
  if (!configure()) {
    console.warn("[push] VAPID keys not set — skipping push.");
    return { ok: false, gone: false };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload)
    );
    return { ok: true, gone: false };
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    const gone = statusCode === 404 || statusCode === 410;
    if (!gone) console.error("[push] send failed:", err);
    return { ok: false, gone };
  }
}
