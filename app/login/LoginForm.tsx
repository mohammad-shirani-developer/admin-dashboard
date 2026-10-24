"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info, LayoutGrid } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import {
  inputClasses,
  primaryButtonClasses,
  withClasses,
} from "@/app/components/ui/form-controls";

const loginFormSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

/* Public demo credentials from dummyjson.com — shown right on the card so
   reviewers can sign in without hunting for them in a README. */
const DEMO_CREDENTIALS: LoginFormValues = {
  username: "emilys",
  password: "emilyspass",
};

const isSafeRelativeTarget = (target: string): boolean =>
  target.startsWith("/") && !target.startsWith("//");

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: DEMO_CREDENTIALS,
  });

  const targetAfterSignIn = () => {
    const next = searchParams.get("next") ?? "/dashboard";
    return isSafeRelativeTarget(next) ? next : "/dashboard";
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        setServerError(
          payload?.message ?? "Something went wrong, please try again",
        );
        return;
      }

      router.replace(targetAfterSignIn());
    } catch {
      setServerError("Network error, please try again");
    }
  });

  const fillDemoCredentials = () => {
    setValue("username", DEMO_CREDENTIALS.username);
    setValue("password", DEMO_CREDENTIALS.password);
    setServerError(null);
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-8 flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white"
          >
            <LayoutGrid className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            TechAdmin
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {serverError && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            {serverError}
          </p>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="login-username"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={
                errors.username ? "login-username-error" : undefined
              }
              className={inputClasses}
              {...register("username")}
            />
            {errors.username && (
              <p
                id="login-username-error"
                className="mt-1.5 text-sm text-red-600 dark:text-red-400"
              >
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
              className={inputClasses}
              {...register("password")}
            />
            {errors.password && (
              <p
                id="login-password-error"
                className="mt-1.5 text-sm text-red-600 dark:text-red-400"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={withClasses(primaryButtonClasses, "w-full")}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-800/50">
          <p className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
            <Info className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            Demo account
          </p>
          <p className="mt-1.5 text-gray-500 dark:text-gray-400">
            username <code className="font-semibold">emilys</code> · password{" "}
            <code className="font-semibold">emilyspass</code>
          </p>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="mt-2.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400"
          >
            Fill demo credentials
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
        Demo authentication via dummyjson.com — nothing you change is saved.
      </p>
    </div>
  );
};

export default LoginForm;
