import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyQstashSignature } from "@/lib/qstash";
import { deliverPunchInReminder } from "@/lib/notify";
import { formatTimeLabel } from "@/lib/time";

export const runtime = "nodejs";

/**
 * Called daily by a QStash schedule at the user's chosen punch-in time.
 * Re-checks the toggle (so a disabled/stale schedule is a no-op) and skips
 * if the user is already clocked in.
 */
export async function POST(req: Request) {
  const bodyText = await req.text();

  if (!(await verifyQstashSignature(req.headers.get("upstash-signature"), bodyText)))
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  let email: string | undefined;
  let time: string | undefined;
  try {
    const parsed = JSON.parse(bodyText);
    email = parsed?.email;
    time = parsed?.time;
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const db = supabaseAdmin();

  // Honor the live toggle — never remind if it was turned off.
  const { data: settings } = await db
    .from("user_settings")
    .select("punch_in_enabled, punch_in_time")
    .eq("user_email", email)
    .maybeSingle();
  if (!settings?.punch_in_enabled)
    return NextResponse.json({ ok: true, skipped: "disabled" });

  // Already on the clock? No need to nudge.
  const { data: open } = await db
    .from("punch_sessions")
    .select("id")
    .eq("user_email", email)
    .is("punched_out_at", null)
    .limit(1);
  if (open && open.length > 0)
    return NextResponse.json({ ok: true, skipped: "already clocked in" });

  const label = formatTimeLabel(time || settings.punch_in_time || "09:30");
  await deliverPunchInReminder(email, label);

  return NextResponse.json({ ok: true });
}
