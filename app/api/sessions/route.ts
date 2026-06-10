import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { scheduleReminder } from "@/lib/qstash";
import { computeRemindAt, DEFAULT_WORKING_MINUTES } from "@/lib/time";

export const runtime = "nodejs";

async function requireEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email ?? null;
}

/** GET → { active: PunchSession | null, recent: PunchSession[] } */
export async function GET() {
  const email = await requireEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("punch_sessions")
    .select("*")
    .eq("user_email", email)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const active = data.find((s) => !s.punched_out_at) ?? null;
  const recent = data.filter((s) => s.punched_out_at);
  return NextResponse.json({ active, recent });
}

/** POST → punch in. Body: { punchInAt?: ISO, workingMinutes?: number } */
export async function POST(req: Request) {
  const email = await requireEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const punchInAt = body.punchInAt
    ? new Date(body.punchInAt).toISOString()
    : new Date().toISOString();
  const workingMinutes = clampMinutes(body.workingMinutes);
  const remindAt = computeRemindAt(punchInAt, workingMinutes);
  const timeZone = typeof body.timeZone === "string" ? body.timeZone : null;

  const db = supabaseAdmin();

  // One open session at a time.
  const { data: existing } = await db
    .from("punch_sessions")
    .select("id")
    .eq("user_email", email)
    .is("punched_out_at", null)
    .limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "You already have an active session. Punch out first." },
      { status: 409 }
    );
  }

  const { data: inserted, error } = await db
    .from("punch_sessions")
    .insert({
      user_email: email,
      punch_in_at: punchInAt,
      working_minutes: workingMinutes,
      remind_at: remindAt,
      time_zone: timeZone,
    })
    .select("*")
    .single();

  if (error || !inserted)
    return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });

  // Schedule the one-shot reminder (no-op locally without QStash creds).
  const messageId = await safeSchedule(inserted.id, remindAt);
  if (messageId) {
    await db
      .from("punch_sessions")
      .update({ qstash_message_id: messageId })
      .eq("id", inserted.id);
    inserted.qstash_message_id = messageId;
  }

  return NextResponse.json({ session: inserted }, { status: 201 });
}

function clampMinutes(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_WORKING_MINUTES;
  return Math.min(Math.max(Math.round(n), 15), 24 * 60);
}

async function safeSchedule(id: string, remindAt: string): Promise<string | null> {
  try {
    return await scheduleReminder(id, remindAt);
  } catch (err) {
    console.error("[sessions] schedule failed:", err);
    return null;
  }
}
