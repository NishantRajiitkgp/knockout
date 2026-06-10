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

  await tx.sendMail({
    from: `"Knockout" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Time to punch out — it's ${time}`,
    text: `Your working hours are up (${time}). Don't forget to punch out. — Knockout\n${appUrl}/dashboard`,
    html: punchOutHtml(time, appUrl),
  });
  return true;
}

function punchOutHtml(time: string, appUrl: string): string {
  return `<!doctype html><html><body style="margin:0;background:#07080a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif;color:#cdcdcd;padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:480px;background:#0d0d0d;border:1px solid #242728;border-radius:16px;overflow:hidden;">
      <tr><td style="height:4px;background:linear-gradient(90deg,#ff5757,#a1131a);"></td></tr>
      <tr><td style="padding:32px 28px;">
        <p style="margin:0;color:#6a6b6c;font-size:13px;letter-spacing:.04em;">KNOCKOUT</p>
        <h1 style="margin:14px 0 0;color:#f4f4f6;font-size:24px;line-height:1.25;font-weight:600;">Time to punch out.</h1>
        <p style="margin:14px 0 0;color:#cdcdcd;font-size:15px;line-height:1.6;">
          It's <strong style="color:#f4f4f6;">${time}</strong> — your working hours are done.
          Clock out now so it doesn't cost you tomorrow morning.
        </p>
        <a href="${appUrl}/dashboard" style="display:inline-block;margin-top:24px;background:#ffffff;color:#000000;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:8px;">Open Knockout</a>
        <p style="margin:28px 0 0;color:#6a6b6c;font-size:12px;line-height:1.6;">
          You're getting this because you punched in on Knockout today. We don't track your work — we just walk you out.
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
