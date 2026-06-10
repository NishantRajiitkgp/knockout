import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin, type PunchSession } from "@/lib/supabase";
import { deliverReminder } from "@/lib/notify";

export const runtime = "nodejs";

/**
 * Sends a punch-out reminder to the signed-in user right now — no schedule,
 * no QStash. Lets you verify email + push delivery locally (where QStash
 * can't reach your machine). Uses the active session if there is one, else a
 * synthetic "now" session.
 */
export async function POST() {
  const email = (await auth())?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseAdmin();
  const { data } = await db
    .from("punch_sessions")
    .select("*")
    .eq("user_email", email)
    .is("punched_out_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const session: PunchSession =
    data?.[0] ??
    ({
      id: "test",
      user_email: email,
      punch_in_at: new Date().toISOString(),
      working_minutes: 0,
      remind_at: new Date().toISOString(),
      time_zone: null,
      qstash_message_id: null,
      reminded_at: null,
      punched_out_at: null,
      created_at: new Date().toISOString(),
    } as PunchSession);

  const result = await deliverReminder(session);
  return NextResponse.json({ ok: true, ...result });
}
