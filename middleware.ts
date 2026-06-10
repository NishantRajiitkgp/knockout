import { auth } from "@/lib/auth";

/**
 * Protects /dashboard. Unauthenticated requests bounce to the landing page,
 * where the CTAs start Google sign-in (which returns to /dashboard).
 */
export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    return Response.redirect(new URL("/", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
