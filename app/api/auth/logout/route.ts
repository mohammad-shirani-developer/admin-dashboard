import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/app/lib/session";

/** Clears the demo session cookie; the client then navigates to /login. */
export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  });

  return response;
}
