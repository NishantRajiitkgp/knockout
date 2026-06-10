import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Which integrations are configured. Returns booleans only — never the
 * secret values. Auth-gated so it isn't a public fingerprint of the deploy.
 */
export async function GET() {
  const email = (await auth())?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    email: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    push: Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    qstash: Boolean(process.env.QSTASH_TOKEN),
  });
}
