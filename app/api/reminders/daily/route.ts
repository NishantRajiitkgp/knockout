import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { createDailySchedule, deleteSchedule } from "@/lib/qstash";
import { dailyCronUtc } from "@/lib/time";

export const runtime = "nodejs";

async function requireEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email ?? null;
}

/** GET → { enabled, time } — daily punch-in reminder settings (defaults off). */
export async function GET() {
  const email = await requireEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseAdmin();
  const { data } = await db
    .from("user_settings")
    .select("*")
    .eq("user_email", email)
    .maybeSingle();

  return NextResponse.json({
    enabled: data?.punch_in_enabled ?? false,
    time: data?.punch_in_time ?? "09:30",
  });
}

/** PUT → { enabled, time, timeZone } — toggle / re-aim the daily schedule. */
export async function PUT(req: Request) {
  const email = await requireEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const enabled = Boolean(body.enabled);
  const time = /^\d{2}:\d{2}$/.test(body.time) ? body.time : "09:30";
  const timeZone = typeof body.timeZone === "string" ? body.timeZone : null;

  const db = supabaseAdmin();

  // Drop any existing schedule first (so toggling/changing re-aims cleanly).
  const { data: existing } = await db
    .from("user_settings")
    .select("schedule_id")
    .eq("user_email", email)
    .maybeSingle();
  await deleteSchedule(existing?.schedule_id ?? null);

  let scheduleId: string | null = null;
  if (enabled) {
    const cron = dailyCronUtc(time, timeZone);
    scheduleId = await createDailySchedule("/api/reminders/punch-in", cron, {
      email,
      time,
      timeZone,
    }).catch((e) => {
      console.error("[daily] schedule create failed:", e);
      return null;
    });
  }

  const { error } = await db.from("user_settings").upsert({
    user_email: email,
    punch_in_enabled: enabled,
    punch_in_time: time,
    time_zone: timeZone,
    schedule_id: scheduleId,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ enabled, time, scheduled: Boolean(scheduleId) });
}
