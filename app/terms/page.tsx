import type { Metadata } from "next";
import { LegalShell, LegalSection, LegalList } from "@/components/legal/LegalShell";

const UPDATED = "June 10, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using Knockout — a free, best-effort reminder to help you punch out on time.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated={UPDATED}
      intro="These terms cover your use of Knockout. We've kept them plain. By signing in and using the app, you agree to what's below."
    >
      <LegalSection heading="The short version">
        <LegalList
          items={[
            "Knockout is a free helper that reminds you to punch out (and optionally, to punch in).",
            "It's a friendly nudge, not your official timekeeping system — don't rely on it alone.",
            "We provide it as-is and do our best to deliver reminders, but can't guarantee delivery.",
            "Be reasonable with it, and you can stop using it whenever you like.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="What Knockout is">
        <p>
          Knockout lets you log a punch-in time and your working hours, then sends you an email and
          browser-push reminder when your day is up — plus an optional daily nudge to clock in. It is
          a convenience reminder, not an employer timekeeping system, payroll tool, or system of
          record.
        </p>
      </LegalSection>

      <LegalSection heading="Reminders are best-effort">
        <p>
          We schedule and send reminders on a best-effort basis. Delivery depends on services outside
          our control — email providers, browser push services, your device, and your network. We
          can't guarantee a reminder will arrive, arrive on time, or be seen. You remain responsible
          for actually punching out and for the accuracy of your own timesheet.
        </p>
      </LegalSection>

      <LegalSection heading="Your account">
        <p>
          You sign in with Google. Keep your Google account secure — activity through your sign-in is
          your responsibility. You must be old enough to work in your jurisdiction to use Knockout.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <p>Please don't:</p>
        <LegalList
          items={[
            "Use Knockout for anything unlawful, or to harass or harm others.",
            "Attempt to break, overload, reverse-engineer, or disrupt the service or its providers.",
            "Access other users' data or use the service to impersonate someone else.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Free service & availability">
        <p>
          Knockout is currently free and provided without uptime guarantees. We may change, pause, or
          discontinue features at any time. We'll try to avoid surprises, but the service is offered
          “as available.”
        </p>
      </LegalSection>

      <LegalSection heading="Disclaimer of warranties">
        <p>
          Knockout is provided “as is” and “as available,” without warranties of any kind, whether
          express or implied, including fitness for a particular purpose and reliability of reminder
          delivery.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the fullest extent permitted by law, Knockout and its makers are not liable for any
          indirect, incidental, or consequential damages, or for any losses arising from a missed,
          late, or undelivered reminder — including payroll or timesheet discrepancies. Knockout is a
          helper, and the responsibility for clocking in and out stays with you.
        </p>
      </LegalSection>

      <LegalSection heading="Termination">
        <p>
          You can stop using Knockout at any time and request deletion of your data. We may suspend or
          end access if these terms are misused or to protect the service.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <p>
          We may update these terms from time to time. When we do, we'll revise the “Last updated”
          date above. Continuing to use Knockout after changes means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these terms? Email{" "}
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
