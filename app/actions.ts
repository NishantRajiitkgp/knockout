"use server";

import { signIn } from "@/lib/auth";

/** Starts the Google OAuth flow and returns to the dashboard. */
export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}
