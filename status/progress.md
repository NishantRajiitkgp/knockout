# Progress - What we're doing right now

Last updated: 2026-06-10 (all 5 parts done)

## Finishing in parts — ALL DONE
- [x] Part 1 — Local verification tools (test reminder + health/diagnostics).
- [x] Part 2 — Auth front-door (landing CTAs → Google sign-in) + route protection (middleware).
- [x] Part 3 — Dashboard UX hardening (toasts, confirm-before-cancel, optimistic updates).
- [x] Part 4 — Timezone + edge cases (overnight shifts, past times, DST).
- [x] Part 5 — Deploy (vercel.json + DEPLOY.md checklist).

## Build is code-complete.
Remaining is on the user: add credentials to `.env.local` (Google first), then
the live end-to-end test. Deploy steps + smoke test live in DEPLOY.md.

## Just completed
- **Part 5 — Deploy.** `vercel.json` (30s maxDuration for the email/push
  reminder functions) + `DEPLOY.md` (env table, Google redirect URIs, ordered
  smoke test, troubleshooting). README Deploy section points to it.
- **Part 4 — Timezone + edge cases.** Added `time_zone` to `punch_sessions`
  (schema + `alter ... if not exists`) and to the `PunchSession` type. Client
  sends IANA tz on punch-in; server formats email/push clock times in the user's
  tz (fixes UTC-on-server bug). `lib/time.ts`: `formatClock(iso, tz)` +
  `isNextDay()`. Dashboard now shows "(next day)" for overnight shifts and an
  amber "already passed — we'll remind you right away" note. DST handled via
  IANA tz + instant math.
- **Part 3 — Dashboard UX hardening.** `components/dashboard/Toast.tsx`
  (dependency-free toast provider/hook, Raycast-styled, reduced-motion safe) +
  toast styles in globals.css. Rewrote `Dashboard.tsx`: parent-owned mutations
  with **optimistic** punch-out & cancel (rollback on error), success/error
  **toasts** on every action, **confirm-before-cancel** inline (no window.confirm),
  shared `HoursStepper`, removed the old red error banner/onError plumbing.
- **Part 2 — Auth front-door + route protection.** `lib/useMagnetic.ts` hook
  (extracted from MagneticButton); `components/auth/SignInButton.tsx` (client,
  `signIn("google", { redirectTo: "/dashboard" })`, optional magnetic + Google
  icon); landing Hero/ClosingCTA/Nav CTAs now start Google sign-in directly;
  `middleware.ts` protects `/dashboard/*` (unauth → `/`); dashboard page now
  redirects unauth to `/` (removed the redundant inline sign-in card).
- **Part 1 — Local verification.** `lib/notify.ts` (shared email+push delivery,
  used by fire + test); `POST /api/reminders/test`; `GET /api/health`;
  `components/dashboard/Diagnostics.tsx` (status badges + "Send test reminder").
- **Full core app build.** Auth (Google/Auth.js v5), Supabase schema + client,
  sessions API (punch in/out/adjust/cancel), QStash one-shot scheduling,
  reminders/fire endpoint (email + push, signature-verified + idempotent),
  push subscribe API, service worker, and the Raycast-styled dashboard
  (punch-in card, live countdown active session, history, enable-reminders).
- Landing page polish pass using the installed design skills + an animated
  Raycast-style flow diagram section.

## Blocked on user (one-time, local)
- PowerShell execution policy blocks the agent's shell, so `npm install` /
  `npm run dev` must be run by the user.
- Credentials needed before full end-to-end testing (see toBeDone.md §Credentials).

## Next
- User: `npm install`, run `supabase/schema.sql`, fill `.env.local`, `npm run dev`.
- Then end-to-end test: sign in → punch in → reminder fires (needs public URL
  for QStash) → email + push received.
