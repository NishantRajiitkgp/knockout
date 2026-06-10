import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { scheduleReminder, cancelReminder } from "@/lib/qstash";
import { computeRemindAt } from "@/lib/time";

export const runtime = "nodejs";

async function requireEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email ?? null;
}

type Ctx = { params: Promise<{ id: string }> };

/** PATCH → { action: "punch_out" } | { action: "adjust", workingMinutes } */
export async function PATCH(req: Request, { params }: Ctx) {
  const email = await requireEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const db = supabaseAdmin();

  const { data: session, error: loadErr } = await db
    .from("punch_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_email", email)
    .single();

  if (loadErr || !session)
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.punched_out_at)
    return NextResponse.json({ error: "Session already closed" }, { status: 409 });

  if (body.action === "punch_out") {
    await cancelReminder(session.qstash_message_id);
    const { data: updated, error } = await db
      .from("punch_sessions")
      .update({ punched_out_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ session: updated });
  }

  if (body.action === "adjust") {
    const workingMinutes = clampMinutes(body.workingMinutes);
    const remindAt = computeRemindAt(session.punch_in_at, workingMinutes);

    // Re-aim: drop the old scheduled message, queue a new one.
    await cancelReminder(session.qstash_message_id);
    const messageId = await scheduleReminder(id, remindAt).catch(() => null);

    const { data: updated, error } = await db
      .from("punch_sessions")
      .update({
        working_minutes: workingMinutes,
        remind_at: remindAt,
        qstash_message_id: messageId,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ session: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

/** DELETE → cancel the session entirely. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const email = await requireEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = supabaseAdmin();

  const { data: session } = await db
    .from("punch_sessions")
    .select("qstash_message_id")
    .eq("id", id)
    .eq("user_email", email)
    .single();

  if (session) await cancelReminder(session.qstash_message_id);

  const { error } = await db
    .from("punch_sessions")
    .delete()
    .eq("id", id)
    .eq("user_email", email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

function clampMinutes(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 510;
  return Math.min(Math.max(Math.round(n), 15), 24 * 60);
}
