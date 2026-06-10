import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Grain } from "@/components/fx/Grain";
import { ScrollProgress } from "@/components/fx/ScrollProgress";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const title = "Knockout — punch out on time, every time";
const description =
  "You remember to clock in. It's leaving you forget. Knockout watches the clock and sends an email + push reminder the moment your shift is done — so 'I forgot to punch out' never costs you another morning.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Knockout",
  },
  description,
  applicationName: "Knockout",
  authors: [{ name: "Knockout" }],
  creator: "Knockout",
  keywords: [
    "punch out reminder",
    "clock out reminder",
    "timesheet reminder",
    "forgot to clock out",
    "attendance reminder",
    "work hours tracker",
    "shift end reminder",
    "punch in punch out app",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Knockout",
    title,
    description:
      "You remember to clock in. It's leaving you forget. Knockout walks you out, on time — email + push, the second your shift ends.",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description:
      "You remember to clock in. It's leaving you forget. Knockout walks you out, on time.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "productivity",
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Knockout",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  url: siteUrl,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Failsafe: if JS never runs (no-JS, headless, crawlers), reveal-gated
            content must still be visible. The animation only enhances. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen bg-canvas font-sans antialiased">
        <ScrollProgress />
        <Grain />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
