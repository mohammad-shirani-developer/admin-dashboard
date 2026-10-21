"use client";

import { AlertCircle } from "lucide-react";
import { primaryButtonClasses } from "@/app/components/ui/form-controls";

/**
 * App-level error boundary styled like the dashboard ErrorState (mockup):
 * red alert icon, "Something went wrong!" message and a blue Retry button.
 */
const AppError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div
        className="flex w-full max-w-md flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900"
        role="alert"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
          <AlertCircle
            className="h-6 w-6 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          Something went wrong!
        </h1>

        <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          Failed to load data. Please try again.
        </p>

        {error.digest ? (
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Error reference: {error.digest}
          </p>
        ) : null}

        <button
          type="button"
          onClick={reset}
          className={`mt-5 ${primaryButtonClasses}`}
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default AppError;
