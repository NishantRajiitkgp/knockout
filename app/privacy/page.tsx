import type { Metadata } from "next";
import { LegalShell, LegalSection, LegalList } from "@/components/legal/LegalShell";

const UPDATED = "June 10, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Knockout handles your data: what we collect, what we never collect, and the few services that help deliver your punch-out reminders.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated={UPDATED}
      intro="Knockout exists to remind you to punch out — nothing more. We collect the bare minimum to do that, we never track how you work, and we don't sell your data to anyone. Here's exactly what that means."
    >
      <LegalSection heading="The short version">
        <LegalList
          items={[
            "We store your Google email and name, your punch times, your working-hours setting, your timezone, and (if you enable it) your push subscription and daily-reminder preference.",
            "We use that only to schedule and send your email and browser-push reminders.",
            "We never track your activity, take screenshots, or monitor what you do during the day.",
            "You can delete your logs in the app at any time, and request full deletion of your account data.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Information we collect">
        <p>When you sign in and use Knockout, we collect:</p>
        <LegalList
          items={[
            "Account info — your email address and name from Google Sign-In. We never see or store your Google password.",
            "Punch data — the punch-in time you enter, your chosen working hours, the computed punch-out time, your timezone, and when you punch out.",
            "Reminder settings — whether you've enabled the optional daily punch-in reminder and the time you picked.",
            "Push subscription — if you enable browser notifications, the subscription token your browser provides so we can send them.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="What we don't collect">
        <p>
          We are not a surveillance tool. We do <span className="text-ink">not</span> collect activity
          logs, screenshots, keystrokes, location beyond your timezone, browsing history, or any
          measure of how productive you are. We know when you said you started and when your hours are
          up — that's the whole picture.
        </p>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <LegalList
          items={[
            "To calculate when your working day ends and schedule a one-time reminder.",
            "To send that reminder by email and, if enabled, browser push notification.",
            "To send an optional daily nudge to punch in, only while you have that toggle switched on.",
            "To show you your recent days and let you manage or delete them.",
          ]}
        />
        <p>We do not use your data for advertising, profiling, or training models.</p>
      </LegalSection>

      <LegalSection heading="Service providers">
        <p>
          A few trusted providers process data on our behalf so the reminders actually reach you:
        </p>
        <LegalList
          items={[
            "Google — sign-in (authentication).",
            "Supabase — secure database that stores your punch sessions and settings.",
            "Upstash QStash — schedules the one-time and daily reminder triggers.",
            "Gmail (SMTP) — delivers reminder emails.",
            "Web Push services (e.g. your browser vendor) — deliver push notifications.",
            "Vercel — hosting and serverless functions.",
          ]}
        />
        <p>
          Each receives only what it needs to perform its function, and we don't sell or share your
          data for any other purpose.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies & sessions">
        <p>
          We use a single secure, signed session cookie to keep you logged in after Google Sign-In.
          We don't use advertising cookies, third-party trackers, or analytics that follow you around
          the web.
        </p>
      </LegalSection>

      <LegalSection heading="Data retention & deletion">
        <p>
          Your punch logs stay until you delete them — each entry in “Recent days” has a delete
          button. You can turn off push and the daily reminder at any time, and you can request
          deletion of all your account data by contacting us. Once deleted, it's gone from our active
          database.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          Data is stored with our database provider and accessed only by Knockout's server using
          privileged keys that never reach your browser. Connections are encrypted in transit. No
          system is perfectly secure, but we keep the data we hold deliberately small.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          Knockout is intended for working adults and is not directed to children under 16. We don't
          knowingly collect data from them.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          If we change how we handle data, we'll update this page and the “Last updated” date above.
          Significant changes will be reflected here before they take effect.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions, or want your data deleted? Email{" "}
          <a
            href="mailto:hello@knockout.app"
            className="font-medium text-ink underline decoration-hairline-strong underline-offset-2 hover:decoration-ink"
          >
            hello@knockout.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
