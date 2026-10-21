/**
 * Shared form-control class constants so every input, select and button in the
 * dashboard renders with one consistent look in light and dark mode. Each
 * component can append its own utilities through the `withClasses` joiner.
 *
 * TechAdmin design system: blue-600 primary actions, white/gray-950 inputs
 * with gray-300/700 borders and blue focus rings.
 */

export const inputClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20";

export const selectClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:focus:border-blue-400 dark:focus:ring-blue-400/20";

export const primaryButtonClasses =
  "rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-offset-gray-950";

export const secondaryButtonClasses =
  "rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:focus-visible:ring-offset-gray-950";

export const dangerButtonClasses =
  "rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-600 dark:hover:bg-red-500 dark:focus-visible:ring-offset-gray-950";

/**
 * Select reset for the bordered "chip" pattern (Calendar icon + select inside
 * one bordered container — see the dashboard page header). The wrapping chip
 * owns the border/background, so the select itself is transparent.
 */
export const chipSelectClasses =
  "cursor-pointer appearance-none bg-transparent py-1.5 pr-1 pl-1 text-sm font-medium text-gray-700 outline-none dark:text-gray-300";

/** Joins truthy class fragments into a single className string. */
export const withClasses = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(" ");
