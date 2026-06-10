import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { supabaseAdmin } from "@/lib/supabase";
import { deliverReminder } from "@/lib/notify";

export const runtime = "nodejs";

/**
 * Called once by QStash at the scheduled punch-out time.
 * Verifies the QStash signature, then sends email + push — guarded so a
 * retry or a late fire after punch-out is a harmless no-op.
 */
export async function POST(req: Request) {
  const bodyText = await req.text();

  const verified = await verifySignature(req, bodyText);
  if (!verified) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  let sessionId: string | undefined;
  try {
    sessionId = JSON.parse(bodyText)?.sessionId;
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

  const db = supabaseAdmin();
  const { data: session } = await db
    .from("punch_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (!session) return NextResponse.json({ ok: true, skipped: "not found" });
  if (session.punched_out_at)
    return NextResponse.json({ ok: true, skipped: "already punched out" });
  if (session.reminded_at)
    return NextResponse.json({ ok: true, skipped: "already reminded" });

  await deliverReminder(session);

  await db
    .from("punch_sessions")
    .update({ reminded_at: new Date().toISOString() })
    .eq("id", sessionId);

  return NextResponse.json({ ok: true });
}

async function verifySignature(req: Request, body: string): Promise<boolean> {
  const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const next = process.env.QSTASH_NEXT_SIGNING_KEY;

  // No keys configured → local/dev mode, accept (QStash also can't reach
  // localhost, so this path is for manual testing only).
  if (!current || !next) {
    console.warn("[fire] QStash signing keys not set — skipping verification.");
    return true;
  }

  const signature = req.headers.get("upstash-signature");
  if (!signature) return false;

  try {
    const receiver = new Receiver({ currentSigningKey: current, nextSigningKey: next });
    return await receiver.verify({ signature, body });
  } catch (err) {
    console.error("[fire] signature verify failed:", err);
    return false;
  }
}
