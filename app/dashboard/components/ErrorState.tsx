"use client";

import { AlertCircle } from "lucide-react";

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
      className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-gray-100 bg-white p-6 text-center shadow-sm"
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>

      <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
