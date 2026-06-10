import { Marquee } from "@/components/fx/Marquee";

const lines = [
  "“I’ll punch out after this one email.”",
  "Got pulled into a meeting at 6.",
  "Walked out talking to a colleague.",
  "Phone died on the commute.",
  "“Wait — did I clock out yesterday?”",
  "Logged 14 hours by accident.",
  "Another correction form for HR.",
  "Remembered at midnight. Again.",
];

export function MarqueeBand() {
  return (
    <section className="relative border-y border-hairline bg-surface/40 py-5">
      <Marquee items={lines} />
    </section>
  );
}
