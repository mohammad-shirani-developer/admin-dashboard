"use client";

import { useMemo, useState } from "react";
import type {
  Product,
  ProductCategory,
  ProductStatus,
} from "@/app/dashboard/types";

export type ProductCategoryFilter = "All" | ProductCategory;
export type ProductStatusFilter = "All" | ProductStatus;
export type ProductSortFilter =
  | "default"
  | "name-asc"
  | "price-desc"
  | "price-asc"
  | "stock-desc";

/** Rows per table page, matching the mockup's 5-row product table. */
export const PRODUCTS_PAGE_SIZE = 5;

type UseProductFiltersOptions = {
  /** Initial search text (e.g. the `q` query param from the navbar search). */
  initialSearch?: string;
};

/** Deterministic client-side ordering; "default" keeps the API (id) order. */
const applySort = (
  products: Product[],
  sort: ProductSortFilter,
): Product[] => {
  const sorted = [...products];

  switch (sort) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "stock-desc":
      return sorted.sort((a, b) => b.stock - a.stock);
    default:
      return sorted;
  }
};

/**
 * Shared product table filters: search text + category + status + sort with a
 * memoized filtered list, 8-per-page pagination, an "are filters active"
 * flag and a reset helper. Every filter change resets the page to 1.
 */
const useProductFilters = (
  products: Product[],
  { initialSearch = "" }: UseProductFiltersOptions = {},
) => {
  const [search, setSearchState] = useState(initialSearch);
  const [category, setCategoryState] = useState<ProductCategoryFilter>("All");
  const [status, setStatusState] = useState<ProductStatusFilter>("All");
  const [sort, setSortState] = useState<ProductSortFilter>("default");
  const [page, setPageState] = useState(1);

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const matches = products.filter((product) => {
      const matchesSearch =
        searchValue.length === 0 ||
        product.name.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesStatus = status === "All" || product.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return applySort(matches, sort);
  }, [products, search, category, status, sort]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    category !== "All" ||
    status !== "All" ||
    sort !== "default";

  const setSearch = (value: string) => {
    setSearchState(value);
    setPageState(1);
  };

  const setCategory = (value: ProductCategoryFilter) => {
    setCategoryState(value);
    setPageState(1);
  };

  const setStatus = (value: ProductStatusFilter) => {
    setStatusState(value);
    setPageState(1);
  };

  const setSort = (value: ProductSortFilter) => {
    setSortState(value);
    setPageState(1);
  };

  const clearFilters = () => {
    setSearchState("");
    setCategoryState("All");
    setStatusState("All");
    setSortState("default");
    setPageState(1);
  };

  const pageCount = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PAGE_SIZE),
  );
  const safePage = Math.min(page, pageCount);

  const pageProducts = useMemo(
    () =>
      filteredProducts.slice(
        (safePage - 1) * PRODUCTS_PAGE_SIZE,
        safePage * PRODUCTS_PAGE_SIZE,
      ),
    [filteredProducts, safePage],
  );

  return {
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    sort,
    setSort,
    filteredProducts,
    page: safePage,
    pageCount,
    pageProducts,
    setPage: setPageState,
    hasActiveFilters,
    clearFilters,
  };
};

export default useProductFilters;
