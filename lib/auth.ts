import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth.js v5 — Google OAuth, JWT sessions (no DB adapter needed).
 * The user's Google email is the identity we key punch sessions on.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  trustHost: true,
});
