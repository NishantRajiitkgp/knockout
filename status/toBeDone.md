# To Be Done - Future plan / remaining tasks

Last updated: 2026-06-10

The code is fully built. What's left is install + credentials + verification.

## 0. Install & run (BLOCKED on user - agent shell is blocked)
- [ ] `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (PowerShell, one-time).
- [ ] `npm install`
- [ ] Run `supabase/schema.sql` in the Supabase SQL editor.
- [ ] Copy `.env.example` → `.env.local` and fill it in.
- [ ] `npm run dev` → http://localhost:3000

## 1-9. Code - DONE
- [x] Auth (Auth.js v5 Google) · [x] DB (Supabase schema + client)
- [x] Sessions API (punch in/out/adjust/cancel) · [x] QStash scheduling
- [x] reminders/fire (email + push, signed, idempotent) · [x] push subscribe + sw.js
- [x] Dashboard UI (punch-in, live countdown, history, enable reminders)
- [x] Email template (nodemailer) · [x] web-push (VAPID)

## 10. Docs - DONE
- [x] `README.md` + `.env.example`.

## Verification (after install + creds)
- [ ] Sign in with Google → lands on dashboard.
- [ ] Punch in → active session shows correct punch-out time + live countdown.
- [ ] Adjust hours → punch-out time re-aims; Cancel/Punch out works.
- [ ] Enable push → browser permission → subscription stored.
- [ ] Reminder fires at punch-out time → email + push received.
      (QStash can't reach localhost — use a tunnel/public URL or a deploy.)

## Credentials needed from user
- [ ] `AUTH_SECRET` (`npx auth secret`)
- [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `GMAIL_USER`, `GMAIL_APP_PASSWORD`
- [ ] `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (`npx web-push generate-vapid-keys`)
- [ ] `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`

## Finishing touches - in parts (user says "next")
- [x] Part 1 — Local verification (test reminder + health/diagnostics).
- [x] Part 2 — Auth front-door (landing → Google sign-in) + middleware route protection.
- [x] Part 3 — Dashboard UX hardening: toasts, confirm-before-cancel, optimistic punch-out/cancel.
- [x] Part 4 — Timezone + edge cases: per-user IANA tz for email/push, overnight "next day", already-passed note, DST.
- [x] Part 5 — Deploy: `vercel.json` + `DEPLOY.md` (env, Google URIs, smoke test). All 5 parts done — code complete.

## Nice-to-haves (future)
- [ ] Weekly summary email; timezone preference; "snooze 10 min" push action.
- [ ] Rate-limit punch-in; soft-delete history; export.
