import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/app/lib/session";

/* Same override used by the data layer, so E2E failure simulations also cut
   the auth endpoint. Never inlined into client bundles. */
const DUMMYJSON_BASE_URL =
  process.env.DUMMYJSON_BASE_URL ?? "https://dummyjson.com";

const AUTH_TIMEOUT_MS = 10_000;

type LoginRouteBody = {
  username?: unknown;
  password?: unknown;
};

type DummyJsonLoginResponse = {
  accessToken?: string;
  id?: number;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
};

/**
 * Demo sign-in: proxies DummyJSON /auth/login server-side so the access
 * token never touches client JS — it goes straight into an httpOnly cookie.
 * Wrong credentials become a clean 401 the login form can render.
 */
export async function POST(request: NextRequest) {
  let body: LoginRouteBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }

  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 },
    );
  }

  try {
    const authResponse = await fetch(`${DUMMYJSON_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, expiresInMins: 60 }),
      signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
      cache: "no-store",
    });

    if (authResponse.status === 400 || authResponse.status === 401) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 },
      );
    }

    if (!authResponse.ok) {
      return NextResponse.json(
        { message: "Sign-in service is unavailable, try again" },
        { status: 502 },
      );
    }

    const authData = (await authResponse.json()) as DummyJsonLoginResponse;

    if (!authData.accessToken) {
      return NextResponse.json(
        { message: "Sign-in service returned an unexpected answer" },
        { status: 502 },
      );
    }

    const result = NextResponse.json({
      user: {
        id: authData.id,
        username: authData.username,
        email: authData.email,
        firstName: authData.firstName,
        lastName: authData.lastName,
      },
    });

    result.cookies.set(SESSION_COOKIE_NAME, authData.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      /* Not `secure` on purpose: the demo also runs as a local production
         build over plain http, where browsers silently drop secure cookies.
         SameSite=lax plus httpOnly keeps the realistic risks covered. */
      secure: false,
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return result;
  } catch {
    return NextResponse.json(
      { message: "Sign-in service is unreachable, try again" },
      { status: 502 },
    );
  }
}
