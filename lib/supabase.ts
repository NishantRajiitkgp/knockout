import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service-role key.
 * Never import this into a client component.
 */
export function supabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export type PunchSession = {
  id: string;
  user_email: string;
  punch_in_at: string;
  working_minutes: number;
  remind_at: string;
  time_zone: string | null;
  qstash_message_id: string | null;
  reminded_at: string | null;
  punched_out_at: string | null;
  created_at: string;
};

export type PushSubscriptionRow = {
  id: string;
  user_email: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
};
