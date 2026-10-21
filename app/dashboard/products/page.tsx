"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ErrorState from "../components/ErrorState";
import TableSkeleton from "../components/TableSkeleton";
import { fetchProducts } from "@/app/lib/api";
import type { Product, ProductCategory, ProductStatus } from "../types";
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

type ProductCategoryFilter = "All" | ProductCategory;
type ProductStatusFilter = "All" | ProductStatus;

const ProductsPage = () => {
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<ProductCategoryFilter>("All");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("All");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const searchValue = search.toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
  };

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
          className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 sm:w-auto"
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
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
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
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:w-64"
        />

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(event.target.value as ProductCategoryFilter)
          }
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:w-48"
        >
          <option value="All">All Categories</option>
          <option value="Laptop">Laptop</option>
          <option value="Phone">Phone</option>
          <option value="Headphones">Headphones</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as ProductStatusFilter)
          }
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:w-48"
        >
          <option value="All">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        {(search || categoryFilter !== "All" || statusFilter !== "All") && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
