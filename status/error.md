# Errors - Ongoing issues / blockers

Last updated: 2026-06-10

## Open errors

- BLOCKER (environment): PowerShell script execution is disabled, so the agent's terminal can't run any command (`node`, `npm`, `next` all fail with "running scripts is disabled on this system"). The agent built all files via the file editor instead.
  Fix (user, one time, in their own PowerShell): `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
  Then: `npm install` and `npm run dev`. Until this is done, the app has not been run/verified in a browser.

- EXPECTED until install: the new code imports packages not yet in `node_modules`
  (`next-auth`, `@supabase/supabase-js`, `@upstash/qstash`, `nodemailer`, `web-push`).
  `npm install` resolves these (versions are already in `package.json`).

## Known constraints / watch-outs (not errors, but keep in mind)

- QStash calls back over the public internet, so the reminder fires against the deployed Vercel URL. For local dev, use a tunnel (e.g. ngrok) or trigger `/api/reminders/fire` manually.
- Vercel Hobby cron is once/day only - that's why we use QStash, not Vercel cron.
- Web Push only works after the user grants notification permission; email is the reliable fallback.
- `/api/reminders/fire` must stay idempotent (guard on `reminded_at` / `punched_out_at`) so QStash retries never double-send.

## Resolved

- (none yet)
