"use client";

import { useMemo, useState } from "react";

/**
 * Client-side table pagination: slices `items` into pages of `pageSize` and
 * clamps the page when the list shrinks (e.g. after a filter change). Call
 * `setPage(1)` from the filter handlers to fully reset on filter changes.
 */
const usePagination = <T,>(items: T[], pageSize = 10) => {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  return {
    page: safePage,
    pageCount,
    pageItems,
    setPage,
    totalItems: items.length,
  };
};

export default usePagination;
