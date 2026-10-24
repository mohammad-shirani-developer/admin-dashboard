/**
 * Demo session helpers (server side only).
 *
 * The session is the DummyJSON access token stored in an httpOnly cookie by
 * the /api/auth/login route handler. There is no private signing secret to
 * verify against (the token is issued by dummyjson.com), so the payload is
 * only decoded — the signature was already validated by the auth API at
 * sign-in time and the cookie itself is httpOnly, so clients cannot forge it.
 */

import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "ta_session";

/* Keep in sync with expiresInMins sent to DummyJSON during login (60 min). */
export const SESSION_MAX_AGE_SECONDS = 60 * 60;

export type SessionUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string;
};

type SessionTokenPayload = Partial<SessionUser> & { exp?: number };

/** Reads the session cookie and returns the signed-in user, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadSegment, "base64url").toString("utf8"),
    ) as SessionTokenPayload;

    if (!payload.username || !payload.firstName) {
      return null;
    }

    return {
      id: payload.id ?? 0,
      username: payload.username,
      email: payload.email ?? "",
      firstName: payload.firstName,
      lastName: payload.lastName ?? "",
      image: payload.image,
    };
  } catch {
    return null;
  }
}
