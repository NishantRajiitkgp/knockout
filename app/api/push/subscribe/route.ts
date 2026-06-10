import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

async function requireEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email ?? null;
}

/** POST → store a Web Push subscription for the signed-in user. */
export async function POST(req: Request) {
  const email = await requireEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await req.json().catch(() => null);
  const endpoint: string | undefined = sub?.endpoint;
  const p256dh: string | undefined = sub?.keys?.p256dh;
  const authKey: string | undefined = sub?.keys?.auth;

  if (!endpoint || !p256dh || !authKey)
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });

  const db = supabaseAdmin();
  const { error } = await db
    .from("push_subscriptions")
    .upsert(
      { user_email: email, endpoint, p256dh, auth: authKey },
      { onConflict: "endpoint" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** DELETE → remove a subscription by endpoint. */
export async function DELETE(req: Request) {
  const email = await requireEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = await req.json().catch(() => ({ endpoint: undefined }));
  if (!endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });

  const db = supabaseAdmin();
  await db
    .from("push_subscriptions")
    .delete()
    .eq("user_email", email)
    .eq("endpoint", endpoint);

  return NextResponse.json({ ok: true });
}
