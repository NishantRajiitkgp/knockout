import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth();
  const email = session?.user?.email;

  // Middleware already gates this route; this is defense-in-depth.
  if (!email) redirect("/");

  return (
    <main className="relative min-h-screen">
      <header className="sticky top-0 z-50 border-b border-hairline/70 bg-canvas/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] text-mute sm:inline">{email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface px-3 py-1.5 text-[13px] font-medium text-body transition-colors hover:border-hairline-strong hover:bg-surface-elevated hover:text-ink"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path
                    d="M15 4h2a2 2 0 012 2v12a2 2 0 01-2 2h-2M10 17l5-5-5-5M15 12H3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <Dashboard userName={session.user?.name ?? null} />
    </main>
  );
}
