"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import FilterSelect from "@/app/components/ui/FilterSelect";
import {
  dangerButtonClasses,
  inputClasses,
  primaryButtonClasses,
  secondaryButtonClasses,
  withClasses,
} from "@/app/components/ui/form-controls";
import useProductFilters, {
  type ProductCategoryFilter,
  type ProductStatusFilter,
} from "@/app/hooks/useProductFilters";
import { fetchProducts } from "@/app/lib/api";
import type { Product } from "../types";
import ErrorState from "../components/ErrorState";
import TableSkeleton from "../components/TableSkeleton";
import ProductForm, {
  type ProductFormSubmitValues,
} from "./components/ProductForm";
import ProductsTable from "./components/ProductsTable";

/**
 * DummyJSON is a read-only API — created/updated/deleted products live only
 * in the React Query cache, with ids coming from a module-level counter.
 */
let createdProductCount = 0;
const nextCreatedProductId = () => {
  createdProductCount += 1;
  return 900000 + createdProductCount;
};

const CATEGORY_OPTIONS: ReadonlyArray<{
  value: ProductCategoryFilter;
  label: string;
}> = [
  { value: "All", label: "All Categories" },
  { value: "Laptop", label: "Laptop" },
  { value: "Phone", label: "Phone" },
  { value: "Headphones", label: "Headphones" },
];

const STATUS_OPTIONS: ReadonlyArray<{
  value: ProductStatusFilter;
  label: string;
}> = [
  { value: "All", label: "All Status" },
  { value: "In Stock", label: "In Stock" },
  { value: "Low Stock", label: "Low Stock" },
  { value: "Out of Stock", label: "Out of Stock" },
];

const ProductsPage = () => {
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const {
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    filteredProducts,
    hasActiveFilters,
    clearFilters,
  } = useProductFilters(products);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleCreateProduct = (values: ProductFormSubmitValues) => {
    // DummyJSON is read-only — the new product is added to the query cache only.
    queryClient.setQueryData<Product[]>(["products"], (previous = []) => [
      {
        id: nextCreatedProductId(),
        name: values.name,
        price: values.price,
        category: values.category,
        stock: values.stock,
        status: values.status,
        description: values.description || undefined,
      },
      ...previous,
    ]);

    handleCloseForm();
  };

  const handleUpdateProduct = (values: ProductFormSubmitValues) => {
    if (!editingProduct) {
      return;
    }

    // DummyJSON is read-only — the edit is applied to the query cache only.
    queryClient.setQueryData<Product[]>(["products"], (previous = []) =>
      previous.map((product) =>
        product.id === editingProduct.id
          ? {
              ...product,
              name: values.name,
              price: values.price,
              category: values.category,
              stock: values.stock,
              status: values.status,
              description: values.description || undefined,
            }
          : product,
      ),
    );

    handleCloseForm();
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) {
      return;
    }

    // DummyJSON is read-only — the delete is applied to the query cache only.
    queryClient.setQueryData<Product[]>(["products"], (previous = []) =>
      previous.filter((product) => product.id !== deletingProduct.id),
    );

    setDeletingProduct(null);
  };

  if (isLoading) {
    return (
      <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>

          <p className="mt-1 text-sm text-gray-500">
            {filteredProducts.length} products found
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className={withClasses(primaryButtonClasses, "w-full sm:w-auto")}
        >
          Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          key={editingProduct ? `edit-${editingProduct.id}` : "create"}
          initialProduct={editingProduct}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={handleCloseForm}
        />
      )}

      {deletingProduct && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-800">Delete Product</h2>

          <p className="mt-2 text-sm text-red-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deletingProduct.name}</span>?
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeletingProduct(null)}
              className={withClasses(
                secondaryButtonClasses,
                "w-full border-white sm:w-auto",
              )}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDelete}
              className={withClasses(dangerButtonClasses, "w-full sm:w-auto")}
            >
              Delete Product
            </button>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={withClasses(inputClasses, "sm:w-64")}
        />

        <FilterSelect
          ariaLabel="Filter by category"
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={setCategory}
          className="sm:w-48"
        />

        <FilterSelect
          ariaLabel="Filter by status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
          className="sm:w-48"
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className={withClasses(secondaryButtonClasses, "px-4 py-2")}
          >
            Clear Filters
          </button>
        )}
      </div>

      <ProductsTable
        products={filteredProducts}
        onEdit={(product) => {
          setDeletingProduct(null);
          setEditingProduct(product);
          setShowForm(true);
        }}
        onDelete={(product) => {
          setEditingProduct(null);
          setShowForm(false);
          setDeletingProduct(product);
        }}
      />
    </div>
  );
};

export default ProductsPage;
