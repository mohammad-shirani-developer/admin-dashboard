"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { withClasses } from "./form-controls";

type PaginationProps = {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  /** Plural noun for the totals line, e.g. "products". */
  itemLabel: string;
  onPageChange: (page: number) => void;
};

/** Compact page list with "…" gaps: 1 … 4 5 6 … 12. */
const buildPageList = (
  page: number,
  pageCount: number,
): Array<number | "gap"> => {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages: Array<number | "gap"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) {
    pages.push("gap");
  }
  for (let current = start; current <= end; current += 1) {
    pages.push(current);
  }
  if (end < pageCount - 1) {
    pages.push("gap");
  }
  pages.push(pageCount);

  return pages;
};

const buttonBaseClasses =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950";

const activeButtonClasses =
  "bg-blue-600 text-white dark:bg-blue-500";

const inactiveButtonClasses =
  "border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800";

/**
 * Numbered pagination with prev/next chevrons, a filled active page and a
 * "Showing X–Y of N" totals line.
 */
const Pagination = ({
  page,
  pageCount,
  totalItems,
  pageSize,
  itemLabel,
  onPageChange,
}: PaginationProps) => {
  if (totalItems === 0) {
    return null;
  }

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);
  const pages = buildPageList(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {firstItem}–{lastItem}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {totalItems.toLocaleString()}
        </span>{" "}
        {itemLabel}
      </p>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className={withClasses(
              buttonBaseClasses,
              inactiveButtonClasses,
              page === 1 && "cursor-not-allowed opacity-50",
            )}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {pages.map((entry, index) =>
            entry === "gap" ? (
              <span
                key={`gap-${index}`}
                className="px-1 text-sm text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                onClick={() => onPageChange(entry)}
                className={withClasses(
                  buttonBaseClasses,
                  entry === page ? activeButtonClasses : inactiveButtonClasses,
                )}
              >
                {entry}
              </button>
            ),
          )}

          <button
            type="button"
            aria-label="Next page"
            disabled={page === pageCount}
            onClick={() => onPageChange(page + 1)}
            className={withClasses(
              buttonBaseClasses,
              inactiveButtonClasses,
              page === pageCount && "cursor-not-allowed opacity-50",
            )}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </nav>
  );
};

export default Pagination;
