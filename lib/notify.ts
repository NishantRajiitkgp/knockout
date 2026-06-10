import { supabaseAdmin, type PunchSession } from "./supabase";
import { sendPunchOutEmail, sendPunchInEmail } from "./email";
import { sendPush } from "./push";
import { formatClock } from "./time";

export type DeliveryResult = { emailSent: boolean; pushSent: number };

/**
 * Sends the punch-out reminder (email + push) for a session and prunes any
 * dead push subscriptions. Shared by the QStash fire route and the manual
 * test route so both behave identically.
 */
export async function deliverReminder(session: PunchSession): Promise<DeliveryResult> {
  const emailSent = await sendPunchOutEmail(
    session.user_email,
    session.remind_at,
    session.time_zone
  ).catch((e) => {
    console.error("[notify] email error:", e);
    return false;
  });

  const db = supabaseAdmin();
  const { data: subs } = await db
    .from("push_subscriptions")
    .select("*")
    .eq("user_email", session.user_email);

  const time = formatClock(session.remind_at, session.time_zone);
  let pushSent = 0;
  for (const sub of subs ?? []) {
    const { ok, gone } = await sendPush(sub, {
      title: "Time to punch out",
      body: `It's ${time} — your working hours are up. Clock out now.`,
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard`,
    });
    if (ok) pushSent++;
    if (gone) await db.from("push_subscriptions").delete().eq("id", sub.id);
  }

  return { emailSent, pushSent };
}

/**
 * Sends the daily punch-in reminder (email + push). `timeLabel` is a friendly
 * "9:30 AM" string. Prunes dead push subscriptions like deliverReminder.
 */
export async function deliverPunchInReminder(
  email: string,
  timeLabel: string
): Promise<DeliveryResult> {
  const emailSent = await sendPunchInEmail(email, timeLabel).catch((e) => {
    console.error("[notify] punch-in email error:", e);
    return false;
  });

  const db = supabaseAdmin();
  const { data: subs } = await db
    .from("push_subscriptions")
    .select("*")
    .eq("user_email", email);

  let pushSent = 0;
  for (const sub of subs ?? []) {
    const { ok, gone } = await sendPush(sub, {
      title: "Time to punch in 🥊",
      body: `it's ${timeLabel} — clock in so we can knock you out on time tonight.`,
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard`,
    });
    if (ok) pushSent++;
    if (gone) await db.from("push_subscriptions").delete().eq("id", sub.id);
  }

  return { emailSent, pushSent };
}
