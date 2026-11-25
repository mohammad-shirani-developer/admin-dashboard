import { NextResponse, type NextRequest } from "next/server";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "@/app/lib/jwt";

/**
 * Network-boundary guard (Next.js 16 renamed middleware.ts -> proxy.ts).
 *
 * Pages under /dashboard require a *valid* session cookie — since Phase 2
 * the cookie holds a JWT we signed ourselves, so the signature and expiry
 * are verified here with the same AUTH_SECRET the login route used (jose
 * runs in the Edge runtime). A stolen-but-expired or forged cookie gets
 * bounced to /login instead of passing the old presence-only check. The
 * login screen bounces signed-in visitors straight back to the dashboard.
 */

const SIGN_IN_PATH = "/login";
const AFTER_SIGN_IN_PATH = "/dashboard";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith(AFTER_SIGN_IN_PATH) && !session) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = SIGN_IN_PATH;
    signInUrl.search = "";

    /* Let the login screen return the visitor to where they were heading. */
    const intendedTarget = `${pathname}${search}`;
    if (intendedTarget !== AFTER_SIGN_IN_PATH) {
      signInUrl.searchParams.set("next", intendedTarget);
    }

    /* Expired or forged cookie: drop it so the login screen doesn't think
       a session still exists on its own bounce-back check. */
    const response = NextResponse.redirect(signInUrl);
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (pathname === SIGN_IN_PATH && session) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = AFTER_SIGN_IN_PATH;
    dashboardUrl.search = "";

    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
