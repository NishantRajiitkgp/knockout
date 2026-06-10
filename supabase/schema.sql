-- Knockout schema. Run in the Supabase SQL editor.
-- Access is via the service-role key from server routes only, so RLS
-- stays enabled with no public policies (service role bypasses RLS).

create extension if not exists "pgcrypto";

-- ── Punch sessions ───────────────────────────────────────────────
create table if not exists public.punch_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_email       text        not null,
  punch_in_at      timestamptz not null,
  working_minutes  integer     not null default 510,   -- 8h 30m
  remind_at        timestamptz not null,
  time_zone        text,                                -- IANA tz, e.g. "Asia/Kolkata"
  qstash_message_id text,
  reminded_at      timestamptz,
  punched_out_at   timestamptz,
  created_at       timestamptz not null default now()
);

-- For databases created before time_zone existed:
alter table public.punch_sessions add column if not exists time_zone text;

create index if not exists punch_sessions_user_idx
  on public.punch_sessions (user_email, created_at desc);

-- One open (not punched-out) session per user at a time is enforced in app logic;
-- this partial index makes "find the active session" fast.
create index if not exists punch_sessions_active_idx
  on public.punch_sessions (user_email)
  where punched_out_at is null;

-- ── Push subscriptions ───────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_email  text not null,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_email);

alter table public.punch_sessions   enable row level security;
alter table public.push_subscriptions enable row level security;
