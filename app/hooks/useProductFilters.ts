"use client";

import { useMemo, useState } from "react";
import type {
  Product,
  ProductCategory,
  ProductStatus,
} from "@/app/dashboard/types";

export type ProductCategoryFilter = "All" | ProductCategory;
export type ProductStatusFilter = "All" | ProductStatus;

/**
 * Shared product table filters: search text + category + status with a
 * memoized filtered list, an "are filters active" flag and a reset helper.
 */
const useProductFilters = (products: Product[]) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategoryFilter>("All");
  const [status, setStatus] = useState<ProductStatusFilter>("All");

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        searchValue.length === 0 ||
        product.name.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesStatus = status === "All" || product.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  const hasActiveFilters =
    search.trim().length > 0 || category !== "All" || status !== "All";

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setStatus("All");
  };

  return {
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    filteredProducts,
    hasActiveFilters,
    clearFilters,
  };
};

export default useProductFilters;
