/**
 * Shared form-control class constants so every input, select and button in the
 * dashboard renders with one consistent look. Each component can append its own
 * utilities through the `withClasses` joiner.
 */

export const inputClasses =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-60";

export const selectClasses =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-60";

export const primaryButtonClasses =
  "rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClasses =
  "rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClasses =
  "rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60";

/** Joins truthy class fragments into a single className string. */
export const withClasses = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(" ");
