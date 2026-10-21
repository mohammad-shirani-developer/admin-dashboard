"use client";

import { AlertCircle } from "lucide-react";
import { primaryButtonClasses } from "@/app/components/ui/form-controls";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

const ErrorState = ({
  title = "Something went wrong!",
  message = "Failed to load data. Please try again.",
  onRetry,
}: ErrorStateProps) => {
  return (
    <div
      className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900"
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
        <AlertCircle
          className="h-6 w-6 text-red-600 dark:text-red-400"
          aria-hidden="true"
        />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>

      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-5 ${primaryButtonClasses}`}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
