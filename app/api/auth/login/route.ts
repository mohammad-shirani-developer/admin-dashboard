import { NextResponse, type NextRequest } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/app/lib/session";
import { signSessionToken } from "@/app/lib/jwt";

/* Compared against when the email doesn't exist, so unknown-email attempts
   burn the same bcrypt cost as wrong-password attempts and response timing
   can't be used to enumerate accounts. Hash of random garbage — verifies
   against nothing. */
const DUMMY_HASH = "$2b$10$viZUeUDTbhzAWa6gxLt/JOV357gfo.46oyPyMfremvsqqoLhy0m.q";

type LoginRouteBody = {
  email?: unknown;
  password?: unknown;
};

/**
 * Real sign-in against the seeded `users` table: bcrypt compare, then the
 * user object goes into an HS256 JWT (app/lib/jwt.ts) inside the same
 * httpOnly cookie the demo used. Wrong credentials become a clean 401.
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

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 },
    );
  }

  let user: {
    id: number;
    name: string;
    email: string;
    role: string;
    image: string | null;
    passwordHash: string | null;
  } | null = null;

  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        passwordHash: true,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Sign-in service is unavailable, try again" },
      { status: 502 },
    );
  }

  /* `passwordHash: null` means "no panel access" (see prisma schema) — the
     DUMMY_HASH path keeps the timing identical to a wrong password. */
  const matches = await compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !user.passwordHash || !matches) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 },
    );
  }

  const token = await signSessionToken(
    {
      sub: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    },
    SESSION_MAX_AGE_SECONDS,
  );

  const result = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  result.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    /* Not `secure` on purpose: the demo also runs as a local production
       build over plain http, where browsers silently drop secure cookies.
       SameSite=lax plus httpOnly keeps the realistic risks covered. Flip to
       `true` when deploying behind https (Phase 4). */
    secure: false,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return result;
}
