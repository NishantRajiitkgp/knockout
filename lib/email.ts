import nodemailer, { type Transporter } from "nodemailer";
import { formatClock } from "./time";

let transporter: Transporter | null = null;

function getTransport(): Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return transporter;
}

export async function sendPunchOutEmail(
  to: string,
  remindAtIso: string,
  timeZone?: string | null
): Promise<boolean> {
  const tx = getTransport();
  if (!tx) {
    console.warn("[email] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping email.");
    return false;
  }

  const time = formatClock(remindAtIso, timeZone);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const v = pickVibe();

  await tx.sendMail({
    from: `"Knockout" <${process.env.GMAIL_USER}>`,
    to,
    subject: v.subject,
    text: `${v.headline}\n\nIt's ${time} — your hours are done. Clock out before midnight-you remembers and spirals. 💀\n\nPunch out: ${appUrl}/dashboard\n\n— Knockout. we don't watch you work, we just make sure you log off. no cap.`,
    html: punchOutHtml(time, appUrl, v),
  });
  return true;
}

export async function sendPunchInEmail(to: string, time: string): Promise<boolean> {
  const tx = getTransport();
  if (!tx) {
    console.warn("[email] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping email.");
    return false;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const v = pickInVibe();

  await tx.sendMail({
    from: `"Knockout" <${process.env.GMAIL_USER}>`,
    to,
    subject: v.subject,
    text: `${v.headline}\n\nit's ${time} — clock in so Knockout can knock you out on time later. punch in: ${appUrl}/dashboard\n\n— Knockout`,
    html: punchInHtml(time, appUrl, v),
  });
  return true;
}

type Vibe = { subject: string; headline: string; body: string; cta: string };

/** Gen-Z energy for the morning clock-in nudge. */
function pickInVibe(): Vibe {
  const vibes: Vibe[] = [
    {
      subject: "rise and clock in bestie ☀️",
      headline: "new day, new punch-in 🥊",
      body: "It's <strong style=\"color:#f4f4f6;\">{time}</strong> — clock in now so future-you isn't doing math on a correction form later. let's get it. 🔥",
      cta: "Punch in 🥊",
    },
    {
      subject: "gm. the clock is waiting ⏰",
      headline: "clock-in o'clock ☀️",
      body: "It's <strong style=\"color:#f4f4f6;\">{time}</strong>. Tap in, and we'll handle knocking you out on time tonight. no thoughts, just vibes. ✨",
      cta: "Clock in",
    },
    {
      subject: "punch in so we can punch you out 🫡",
      headline: "start the clock, bestie 🕘",
      body: "It's <strong style=\"color:#f4f4f6;\">{time}</strong> — clock in now and Knockout's already on cleanup duty for tonight. 🫶",
      cta: "Start my day",
    },
  ];
  return vibes[(Math.random() * vibes.length) | 0];
}

function punchInHtml(time: string, appUrl: string, v: Vibe): string {
  const body = v.body.replace("{time}", time);
  return `<!doctype html><html><body style="margin:0;background:#07080a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif;color:#cdcdcd;padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:480px;background:#0d0d0d;border:1px solid #242728;border-radius:16px;overflow:hidden;">
      <tr><td style="height:4px;background:linear-gradient(90deg,#59d499,#2f8f63);"></td></tr>
      <tr><td style="padding:30px 28px 32px;">
        <p style="margin:0;color:#6a6b6c;font-size:12px;letter-spacing:.18em;font-weight:600;">KNOCKOUT</p>
        <div style="margin:18px 0 4px;font-size:44px;line-height:1;">☀️</div>
        <h1 style="margin:10px 0 0;color:#f4f4f6;font-size:28px;line-height:1.18;font-weight:700;letter-spacing:-0.01em;">${v.headline}</h1>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 0;">
          <tr><td style="background:#141414;border:1px solid #242728;border-radius:999px;padding:7px 14px;color:#7CF0BD;font-size:13px;font-weight:600;letter-spacing:.02em;">⏰ punch-in time · ${time}</td></tr>
        </table>
        <p style="margin:18px 0 0;color:#cdcdcd;font-size:15px;line-height:1.65;">${body}</p>
        <a href="${appUrl}/dashboard" style="display:inline-block;margin-top:24px;background:#ffffff;color:#000000;text-decoration:none;font-weight:700;font-size:14px;padding:13px 24px;border-radius:10px;">${v.cta}</a>
        <p style="margin:30px 0 0;color:#5f6061;font-size:12px;line-height:1.7;border-top:1px solid #1c1f20;padding-top:18px;">
          you turned on daily clock-in reminders 🫶 toggle them off anytime in the app. we don't watch you work — we just keep the clock honest.
        </p>
      </td></tr>
    </table>
    <p style="margin:16px 0 0;color:#3f4041;font-size:11px;">clock in. we've got tonight. 🌙</p>
  </td></tr></table>
</body></html>`;
}

/** A little randomized Gen-Z energy so the nudge never feels like the same robot. */
function pickVibe(): Vibe {
  const vibes: Vibe[] = [
    {
      subject: "bestie. clock out. now. 🥊",
      headline: "that's a wrap 🎬",
      body: "Your shift literally said <em>bye</em>. It's <strong style=\"color:#f4f4f6;\">{time}</strong> — punch out before future-you is filing an HR correction form at midnight. 💀",
      cta: "Punch out now 🥊",
    },
    {
      subject: "it's giving overtime — don't 🫠",
      headline: "log off, icon 💅",
      body: "The clock hit <strong style=\"color:#f4f4f6;\">{time}</strong> and your hours are <em>so</em> over. Close the laptop, log off, go be a person. ✨",
      cta: "Clock me out",
    },
    {
      subject: "touch grass o'clock 🌱",
      headline: "go home, you ate today 🔥",
      body: "It's <strong style=\"color:#f4f4f6;\">{time}</strong>. You showed up, you did the thing. Now punch out before the timesheet catches you slippin'. 🫶",
      cta: "Punch out 🌱",
    },
    {
      subject: "9-to-5 has left the chat 🫡",
      headline: "shift = knocked out 🥊",
      body: "Hours done as of <strong style=\"color:#f4f4f6;\">{time}</strong>. Don't be the legend logging 14 hours by accident again. Clock out, bestie. 🫡",
      cta: "Log off",
    },
  ];
  return vibes[(Math.random() * vibes.length) | 0];
}

function punchOutHtml(time: string, appUrl: string, v: Vibe): string {
  const body = v.body.replace("{time}", time);
  return `<!doctype html><html><body style="margin:0;background:#07080a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif;color:#cdcdcd;padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:480px;background:#0d0d0d;border:1px solid #242728;border-radius:16px;overflow:hidden;">
      <tr><td style="height:4px;background:linear-gradient(90deg,#ff5757,#a1131a);"></td></tr>
      <tr><td style="padding:30px 28px 32px;">
        <p style="margin:0;color:#6a6b6c;font-size:12px;letter-spacing:.18em;font-weight:600;">KNOCKOUT</p>
        <div style="margin:18px 0 4px;font-size:44px;line-height:1;">🥊</div>
        <h1 style="margin:10px 0 0;color:#f4f4f6;font-size:28px;line-height:1.18;font-weight:700;letter-spacing:-0.01em;">${v.headline}</h1>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 0;">
          <tr><td style="background:#141414;border:1px solid #242728;border-radius:999px;padding:7px 14px;color:#7CF0BD;font-size:13px;font-weight:600;letter-spacing:.02em;">⏰ punch-out time · ${time}</td></tr>
        </table>
        <p style="margin:18px 0 0;color:#cdcdcd;font-size:15px;line-height:1.65;">${body}</p>
        <a href="${appUrl}/dashboard" style="display:inline-block;margin-top:24px;background:#ffffff;color:#000000;text-decoration:none;font-weight:700;font-size:14px;padding:13px 24px;border-radius:10px;">${v.cta}</a>
        <p style="margin:30px 0 0;color:#5f6061;font-size:12px;line-height:1.7;border-top:1px solid #1c1f20;padding-top:18px;">
          you got this bc you clocked in today 🫶 we don't watch you work — we just make sure you log tf off. no cap.
        </p>
      </td></tr>
    </table>
    <p style="margin:16px 0 0;color:#3f4041;font-size:11px;">go home. the clock already did. 🌙</p>
  </td></tr></table>
</body></html>`;
}
