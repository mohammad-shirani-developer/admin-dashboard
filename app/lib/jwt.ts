/**
 * Session-token issuing and verification (server + proxy side).
 *
 * HS256 via `jose` — no external identity provider. The same secret signs
 * tokens at sign-in time and verifies them in proxy.ts (Edge runtime, where
 * `jose` is the only practical WebCrypto option) and in `getSessionUser()`.
 *
 * `AUTH_SECRET` must be set in `.env` — generate one with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

import { SignJWT, jwtVerify } from "jose";

export type SessionTokenPayload = {
  /* Prisma User.id as a string — JWT `sub` is a string-or-uri by spec. */
  sub: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

const ALGORITHM = "HS256";

/** Shared cookie name — lives here because proxy.ts (Edge runtime) imports
    this module and must not pull in `next/headers` via session.ts. */
export const SESSION_COOKIE_NAME = "ta_session";

/** Lazy so importing this module never crashes a build without .env. */
const getSigningKey = (): Uint8Array => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set — add it to .env (see jwt.ts header comment)",
    );
  }
  return new TextEncoder().encode(secret);
};

/** Signs a session JWT for the given user. Expires via maxAge by caller. */
export function signSessionToken(
  user: SessionTokenPayload,
  expiresInSeconds: number,
): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);

  return new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.image !== undefined && user.image !== null
      ? { image: user.image }
      : {}),
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(user.sub)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + expiresInSeconds)
    .sign(getSigningKey());
}

/** Verifies signature + expiry. Returns the payload, or null if invalid. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionTokenPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      algorithms: [ALGORITHM],
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      image:
        typeof payload.image === "string" ? payload.image : null,
    };
  } catch {
    /* Bad signature, expired, malformed — all just "not signed in". */
    return null;
  }
}
