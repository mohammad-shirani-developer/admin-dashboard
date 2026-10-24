import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

/* Reads ?next= at request time, so render per request instead of statically. */
export const dynamic = "force-dynamic";

/**
 * Demo sign-in screen. The dashboard itself is guarded by proxy.ts — this
 * page is the only way in: credentials go to /api/auth/login, which stores
 * the DummyJSON access token in an httpOnly session cookie.
 */
const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <LoginForm />
    </main>
  );
};

export default LoginPage;
