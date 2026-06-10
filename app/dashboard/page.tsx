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
          <div className="flex items-center gap-4">
            <span className="hidden text-[13px] text-ash sm:inline">{email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-[13px] font-medium text-mute transition-colors hover:text-ink"
              >
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
