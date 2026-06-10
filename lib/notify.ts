import { supabaseAdmin, type PunchSession } from "./supabase";
import { sendPunchOutEmail } from "./email";
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
