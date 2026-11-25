/**
 * Session helpers (server side only).
 *
 * The session is a real HS256 JWT signed with AUTH_SECRET at sign-in time
 * (see app/lib/jwt.ts and /api/auth/login) and stored in an httpOnly cookie.
 * Unlike the old DummyJSON demo, the signature is now ours — so it is
 * verified on every read, not just decoded.
 */

import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/jwt";

export { SESSION_COOKIE_NAME };

/* Seven days. Keep in sync with the maxAge set by /api/auth/login. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  image: string | null;
};

/** Reads the session cookie, verifies the JWT, returns the user or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const payload = await verifySessionToken(token);
  if (!payload) {
    return null;
  }

  const id = Number.parseInt(payload.sub, 10);
  if (Number.isNaN(id)) {
    return null;
  }

  return {
    id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    image: payload.image ?? null,
  };
}
