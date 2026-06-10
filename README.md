# Knockout

You remember to clock in. It's leaving you forget. **Knockout** watches the clock and, the second your shift is done, sends an **email + push notification** telling you to punch out — so "I forgot to clock out" never costs you another morning.

Built with Next.js (App Router) + Tailwind, a Raycast-style dark UI, Google sign-in, and an event-driven reminder (no polling, no timers running on your device).

---

## How it works

```
Punch in ──▶ schedule ONE QStash message (notBefore = punch-out time)
                                   │
                    at that exact second, QStash POSTs
                                   ▼
            /api/reminders/fire ──▶ email (Gmail SMTP) + Web Push
```

- **No cron / no polling.** At punch-in we publish a single delayed QStash message. QStash calls us back once, at the right time. Adjusting hours re-aims it; punching out cancels it.
- **Idempotent fire.** The fire endpoint verifies the QStash signature and no-ops if the session was already punched out or already reminded.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TS) + Tailwind |
| Auth | Auth.js v5 — Google OAuth, JWT sessions |
| Database | Supabase (Postgres), service-role from server routes |
| Scheduling | Upstash QStash (one-shot delayed message) |
| Email | Nodemailer + Gmail SMTP (App Password) |
| Push | Web Push (VAPID) + service worker |

## Project layout

```
app/
  page.tsx                     landing page
  dashboard/page.tsx           auth-gated dashboard (sign in / punch in / out)
  api/auth/[...nextauth]/      Auth.js handler
  api/sessions/                POST punch-in · GET current+recent
  api/sessions/[id]/           PATCH punch-out / adjust · DELETE cancel
  api/push/subscribe/          store / remove a push subscription
  api/reminders/fire/          QStash callback → email + push
lib/                           auth, supabase, time, email, push, qstash
components/dashboard/          Dashboard, EnableReminders
public/sw.js                   service worker (shows notifications)
supabase/schema.sql            database schema
```

---

## Setup

### 1. Install

> On Windows PowerShell, if scripts are blocked, first run:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

```bash
npm install
```

### 2. Database

Create a Supabase project, open the **SQL editor**, and run [`supabase/schema.sql`](supabase/schema.sql).

### 3. Environment

Copy `.env.example` to `.env.local` and fill it in:

| Variable | Where to get it |
|---|---|
| `AUTH_SECRET` | `npx auth secret` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console → OAuth client. Redirect URI: `<url>/api/auth/callback/google` |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Google Account → App Passwords (needs 2FA) |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys` (public key goes in both VAPID_PUBLIC_KEY and the NEXT_PUBLIC one) |
| `QSTASH_TOKEN` / `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY` | Upstash Console → QStash |

### 4. Run

```bash
npm run dev    # http://localhost:3000
```

---

## Local testing notes

- **The app runs without every credential.** Missing QStash/Gmail/VAPID keys are logged and skipped, so you can develop the UI before wiring services.
- **QStash can't reach `localhost`.** To test real reminder delivery locally, expose your dev server with a tunnel (e.g. `ngrok http 3000`) and set `NEXT_PUBLIC_APP_URL` to the public URL — or just test reminders on a deployed instance.
- **Push needs HTTPS** (or `localhost`, which browsers treat as secure).

## Deploy

See **[DEPLOY.md](DEPLOY.md)** for the full Vercel checklist (env vars, Google
redirect URIs, and a step-by-step smoke test). In short: push to GitHub, import
to Vercel, set every variable from `.env.example` (with `NEXT_PUBLIC_APP_URL` /
`NEXTAUTH_URL` = your production URL), add `<prod-url>/api/auth/callback/google`
to the Google OAuth client, run `supabase/schema.sql`, and deploy. QStash can
reach a deployed URL (unlike localhost), so scheduled reminders work in prod.

## Privacy

Knockout stores only your punch-in time, chosen working hours, and computed punch-out time. No activity tracking, no screenshots. It knows when you started — nothing more — and when to stop you.
"# knockoutl" 
