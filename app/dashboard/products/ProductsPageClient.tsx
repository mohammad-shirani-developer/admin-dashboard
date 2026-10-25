"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import FilterSelect from "@/app/components/ui/FilterSelect";
import {
  dangerButtonClasses,
  inputClasses,
  primaryButtonClasses,
  secondaryButtonClasses,
  withClasses,
} from "@/app/components/ui/form-controls";
import Pagination from "@/app/components/ui/Pagination";
import useProductFilters, {
  type ProductCategoryFilter,
  type ProductSortFilter,
  type ProductStatusFilter,
  PRODUCTS_PAGE_SIZE,
} from "@/app/hooks/useProductFilters";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "@/app/lib/api";
import type { ProductWriteInput } from "@/app/lib/api";
import type { Product } from "../types";
import ErrorState from "../components/ErrorState";
import TableSkeleton from "../components/TableSkeleton";
import ProductForm, {
  type ProductFormSubmitValues,
} from "./components/ProductForm";
import ProductsTable from "./components/ProductsTable";

/**
 * Mutations hit the real DummyJSON write endpoints (POST /products/add,
 * PUT/DELETE /products/:id) and every list change is applied optimistically:
 * the cache updates before the request, so the UI reacts instantly, and a
 * failed request rolls the snapshot back instead of leaving the table in a
 * state the server never confirmed. Entities created this session stay
 * cache-only afterwards — DummyJSON's fake database would 404 them (see
 * api.ts) — while original entities are really written.
 */

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

const SORT_OPTIONS: ReadonlyArray<{ value: ProductSortFilter; label: string }> = [
  { value: "default", label: "Sort: Featured" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "stock-desc", label: "Stock: High to Low" },
];

const ProductsPageClient = ({ initialQuery }: { initialQuery: string }) => {
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const {
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    sort,
    setSort,
    filteredProducts,
    page,
    pageCount,
    pageProducts,
    setPage,
    hasActiveFilters,
    clearFilters,
  } = useProductFilters(products, { initialSearch: initialQuery });

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setSubmitError(null);
  };

  /* ------------------------------ mutations ------------------------------ */

  const createProductMutation = useMutation({
    mutationFn: (input: ProductWriteInput) => createProduct(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });

      const optimisticId = -Date.now();

      queryClient.setQueryData<Product[]>(["products"], (old = []) => [
        {
          id: optimisticId,
          name: input.name,
          price: input.price,
          category: input.category,
          stock: input.stock,
          status: input.status,
          description: input.description || undefined,
          thumbnail: input.imageUrl || undefined,
        },
        ...old,
      ]);

      return { optimisticId };
    },
    onSuccess: (createdProduct, _input, context) => {
      // Swap the optimistic row for the created one (unique local id).
      queryClient.setQueryData<Product[]>(["products"], (old = []) =>
        old.map((product) =>
          product.id === context?.optimisticId ? createdProduct : product,
        ),
      );

      // The optimistic row is prepended, so it always lands on page 1.
      setPage(1);
      handleCloseForm();
    },
    onError: (_error, _input, context) => {
      /* Narrow rollback: only the optimistic row is removed. Restoring a
         whole-list snapshot here would silently revert an unrelated
         mutation that succeeded while this create was in flight. */
      queryClient.setQueryData<Product[]>(["products"], (old = []) =>
        old.filter((product) => product.id !== context?.optimisticId),
      );

      // The form stays open with the values intact so nothing is retyped.
      setSubmitError("Could not create the product. Please try again.");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (product: Product) => updateProduct(product),
    onMutate: async (updatedProduct) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });

      // Snapshot only the affected row — not the whole list.
      const previousProduct = queryClient
        .getQueryData<Product[]>(["products"])
        ?.find((product) => product.id === updatedProduct.id);

      queryClient.setQueryData<Product[]>(["products"], (old = []) =>
        old.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product,
        ),
      );

      return { previousProduct };
    },
    onSuccess: (savedProduct) => {
      queryClient.setQueryData<Product[]>(["products"], (old = []) =>
        old.map((product) =>
          product.id === savedProduct.id ? savedProduct : product,
        ),
      );

      handleCloseForm();
    },
    onError: (_error, _updatedProduct, context) => {
      /* Narrow rollback: only the edited row reverts. A wholesale snapshot
         restore would also revert unrelated mutations that succeeded while
         this save was in flight. */
      if (context?.previousProduct) {
        const previousProduct = context.previousProduct;

        queryClient.setQueryData<Product[]>(["products"], (old = []) =>
          old.map((product) =>
            product.id === previousProduct.id ? previousProduct : product,
          ),
        );
      }

      setSubmitError("Could not save the changes. Please try again.");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (product: Product) => deleteProduct(product),
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });

      const oldProducts = queryClient.getQueryData<Product[]>([
        "products",
      ]);
      const deletedAtIndex = (oldProducts ?? []).findIndex(
        (candidate) => candidate.id === product.id,
      );

      queryClient.setQueryData<Product[]>(["products"], (old = []) =>
        old.filter((candidate) => candidate.id !== product.id),
      );

      setDeletingProduct(null);
      setDeleteError(null);

      return { deletedProduct: product, deletedAtIndex };
    },
    onError: (_error, _product, context) => {
      if (context?.deletedProduct) {
        /* Narrow rollback: re-insert only the deleted row at its original
           position instead of restoring the whole pre-delete snapshot. */
        queryClient.setQueryData<Product[]>(["products"], (old = []) => {
          if (
            old.some(
              (candidate) => candidate.id === context.deletedProduct.id,
            )
          ) {
            return old;
          }

          const restored = [...old];

          restored.splice(
            Math.min(context.deletedAtIndex, restored.length),
            0,
            context.deletedProduct,
          );

          return restored;
        });
      }

      setDeleteError(
        `Could not delete ${context?.deletedProduct.name ?? "the product"}. The list was restored — please try again.`,
      );
    },
  });

  const handleCreateProduct = (values: ProductFormSubmitValues) => {
    // Optimistic: the row appears instantly and is replaced by the
    // server-created product (real id) once POST /products/add answers.
    createProductMutation.mutate({
      name: values.name,
      price: values.price,
      category: values.category,
      stock: values.stock,
      status: values.status,
      description: values.description || undefined,
      imageUrl: values.imageUrl || undefined,
    });
  };

  const handleUpdateProduct = (values: ProductFormSubmitValues) => {
    if (!editingProduct) {
      return;
    }

    // Optimistic: the edit applies to the table at once; a failed PUT
    // rolls the row back and reopens the error inside the form.
    updateProductMutation.mutate({
      ...editingProduct,
      name: values.name,
      price: values.price,
      category: values.category,
      stock: values.stock,
      status: values.status,
      description: values.description || undefined,
      thumbnail: values.imageUrl || undefined,
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) {
      return;
    }

    // Optimistic: the row disappears at once; a failed DELETE restores it
    // and surfaces the error above the table.
    deleteProductMutation.mutate(deletingProduct);
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
        <ErrorState onRetry={() => void refetch()} retrying={isFetching} />
      </div>
    );
  }

  return (
    <div className="mx-4 mt-6 pb-6 sm:mx-6 lg:mx-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your products
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className={withClasses(
            primaryButtonClasses,
            "inline-flex w-full items-center justify-center gap-2 sm:w-auto",
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          key={editingProduct ? `edit-${editingProduct.id}` : "create"}
          initialProduct={editingProduct}
          submitting={
            createProductMutation.isPending || updateProductMutation.isPending
          }
          submitError={submitError}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={handleCloseForm}
        />
      )}

      {deletingProduct && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/40">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
            Delete Product
          </h2>

          <p className="mt-2 text-sm text-red-700 dark:text-red-300/90">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {deletingProduct.name}
            </span>
            ?
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeletingProduct(null)}
              className={withClasses(
                secondaryButtonClasses,
                "w-full sm:w-auto dark:border-gray-700",
              )}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={deleteProductMutation.isPending}
              onClick={handleConfirmDelete}
              className={withClasses(
                dangerButtonClasses,
                "w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
              )}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete Product"}
            </button>
          </div>
        </div>
      )}

      {deleteError && (
        <div
          className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          <span>{deleteError}</span>

          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="font-semibold underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={withClasses(inputClasses, "sm:w-56")}
        />

        <FilterSelect
          ariaLabel="Filter by category"
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={setCategory}
          className="sm:w-44"
        />

        <FilterSelect
          ariaLabel="Filter by status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
          className="sm:w-40"
        />

        <FilterSelect
          ariaLabel="Sort products"
          value={sort}
          options={SORT_OPTIONS}
          onChange={setSort}
          className="sm:w-52"
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
        products={pageProducts}
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

      <Pagination
        page={page}
        pageCount={pageCount}
        totalItems={filteredProducts.length}
        pageSize={PRODUCTS_PAGE_SIZE}
        itemLabel="products"
        onPageChange={setPage}
      />
    </div>
  );
};

/** Client island for the products page; `?q=` comes from the server page. */
export default ProductsPageClient;
