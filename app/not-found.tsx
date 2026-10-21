"use client";

import { Box } from "lucide-react";
import { primaryButtonClasses } from "@/app/components/ui/form-controls";

/**
 * Root 404 page matching the mockup: box icon, big "404", "Page Not Found"
 * heading, muted explanation and a blue Go Back button.
 */
const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-gray-50 px-4 py-24 text-center dark:bg-gray-950">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
        <Box
          className="h-7 w-7 text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
      </div>

      <p className="mt-6 text-6xl font-bold text-gray-900 dark:text-white">
        404
      </p>

      <h1 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
        Not Found
      </h1>

      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        The page you are looking for doesn&apos;t exist.
      </p>

      <button
        type="button"
        onClick={() => window.history.back()}
        className={`mt-6 ${primaryButtonClasses}`}
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFoundPage;
