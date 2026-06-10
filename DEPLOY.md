# Deploying Knockout (Vercel)

Knockout is a standard Next.js app — Vercel needs no special build config. The
only `vercel.json` here just gives the reminder functions (email + push) up to
30s to run. The work is wiring up the five services and pointing everything at
your production URL.

## Prerequisites (create these first)

- A **GitHub** repo with this code pushed.
- **Supabase** project (run `supabase/schema.sql` in the SQL editor).
- **Google OAuth** client (Google Cloud Console → APIs & Services → Credentials).
- **Gmail App Password** (Google Account → Security → App passwords; needs 2FA).
- **Upstash QStash** (console.upstash.com → QStash): copy the token + both signing keys.
- **VAPID keys**: `npx web-push generate-vapid-keys`.
- **Auth secret**: `npx auth secret` (or `openssl rand -base64 32`).

## 1. Import to Vercel

1. Vercel → **Add New → Project** → import the GitHub repo.
2. Framework preset is auto-detected as **Next.js**. Leave build/output defaults.
3. **Don't deploy yet** — add env vars first (step 2), or deploy and then redeploy.

## 2. Environment variables (Project → Settings → Environment Variables)

Set all of these for **Production** (and Preview if you want PR deploys to work):

| Variable | Production value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://<your-domain>` |
| `NEXTAUTH_URL` | `https://<your-domain>` |
| `AUTH_SECRET` | from `npx auth secret` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | from Google OAuth client |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | from Supabase → Settings → API |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | your Gmail + app password |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | from `web-push generate-vapid-keys` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | same value as `VAPID_PUBLIC_KEY` |
| `QSTASH_TOKEN` / `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY` | from Upstash QStash |

> **Important — `NEXT_PUBLIC_*` are inlined at build time.** If you change
> `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, you must **redeploy**
> for the new value to take effect.

## 3. Point Google OAuth at production

In the Google OAuth client:

- **Authorized JavaScript origins**: `https://<your-domain>`
- **Authorized redirect URIs**: `https://<your-domain>/api/auth/callback/google`

(Keep the `http://localhost:3000` entries too if you still develop locally.)

## 4. Deploy

Trigger a deploy (push to `main` or **Redeploy** in Vercel). Because
`NEXT_PUBLIC_APP_URL` is set, the QStash callback URL and email links now point
at production — and QStash can reach it (unlike localhost).

## 5. Smoke test (in order)

1. Open `https://<your-domain>` → click a **Sign in / Start** CTA → Google → lands on `/dashboard`.
2. On the dashboard, open **Setup & diagnostics** (bottom) → all four badges green (Database, Email, Push, Scheduling).
3. Click **Enable push reminders** → accept the browser prompt (push needs HTTPS — now satisfied).
4. Click **Send test reminder** → you get an **email** and a **push notification** within seconds. ✅ delivery works.
5. **Real schedule test:** punch in with a punch-in time set so the punch-out is ~2 minutes out (e.g. now − 8h 28m at 8h 30m). Wait. QStash should POST `/api/reminders/fire` and you get email + push at the computed time. ✅ scheduling works.
6. **Punch out** before it fires → reminder is cancelled (no notification). **Adjust hours** → punch-out time re-aims.

## Custom domain

Add the domain in Vercel, then update `NEXT_PUBLIC_APP_URL` + `NEXTAUTH_URL` to it
and add the new redirect URI/origin in Google. Redeploy.

## Troubleshooting

- **`redirect_uri_mismatch`** → the Google redirect URI must exactly match `https://<domain>/api/auth/callback/google`.
- **Sign-in fails / `MissingSecret`** → `AUTH_SECRET` not set. On non-Vercel hosts you may also need `AUTH_TRUST_HOST=true`.
- **Reminder never arrives** → check Upstash QStash logs (message published? delivery 200?). Confirm `NEXT_PUBLIC_APP_URL` is the public URL and signing keys are set. Use **Send test reminder** to isolate delivery from scheduling.
- **Push prompt never appears** → only works on HTTPS (or localhost); check `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set and you redeployed after setting it.
- **Email not sent** → Gmail App Password (not your login password); 2FA must be on.
