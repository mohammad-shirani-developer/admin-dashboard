import { NextResponse, type NextRequest } from "next/server";

/**
 * Network-boundary guard (Next.js 16 renamed middleware.ts -> proxy.ts).
 *
 * Pages under /dashboard require a session cookie; the login screen bounces
 * signed-in visitors straight back to the dashboard. The cookie's *presence*
 * is checked here — its validity is the auth API's job at sign-in time, and
 * the httpOnly flag keeps clients from forging it.
 */

const SESSION_COOKIE_NAME = "ta_session";
const SIGN_IN_PATH = "/login";
const AFTER_SIGN_IN_PATH = "/dashboard";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith(AFTER_SIGN_IN_PATH) && !hasSession) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = SIGN_IN_PATH;
    signInUrl.search = "";

    /* Let the login screen return the visitor to where they were heading. */
    const intendedTarget = `${pathname}${search}`;
    if (intendedTarget !== AFTER_SIGN_IN_PATH) {
      signInUrl.searchParams.set("next", intendedTarget);
    }

    return NextResponse.redirect(signInUrl);
  }

  if (pathname === SIGN_IN_PATH && hasSession) {
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
