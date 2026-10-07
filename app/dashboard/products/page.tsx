"use client";

import { useState } from "react";
import { initialProducts } from "../data/productsData";
import type { Product, ProductCategory, ProductStatus } from "../types";
import ProductsTable from "./components/ProductsTable";

type ProductCategoryFilter = "All" | ProductCategory;
type ProductStatusFilter = "All" | ProductStatus;

const expectedStatus = (stockValue: number): ProductStatus => {
  if (stockValue > 5) {
    return "In Stock";
  }
  if (stockValue > 0) {
    return "Low Stock";
  }
  return "Out of Stock";
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState<ProductCategoryFilter>("All");

  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("All");

  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [formError, setFormError] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((product) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(searchValue) ||
      product.category.toLowerCase().includes(searchValue);

    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;

    const matchesStatus =
      statusFilter === "All" || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
  };

  const resetForm = () => {
    setProductName("");
    setPrice("");
    setCategory("");
    setStock("");
    setStatus("");
    setFormError("");
  };

  const handleAddProduct = () => {
    setFormError("");

    const trimmedName = productName.trim();
    const priceNumber = Number(price);
    const stockNumber = Number(stock);

    if (!trimmedName) {
      setFormError("Product name is required.");
      return;
    }
    if (trimmedName.length < 2) {
      setFormError("Product name must be at least 2 characters long.");
      return;
    }

    if (!price || Number.isNaN(priceNumber) || priceNumber <= 0) {
      setFormError("Price must be a valid number greater than 0.");
      return;
    }

    if (!category) {
      setFormError("Please select a category.");
      return;
    }

    if (!status) {
      setFormError("Please select a status.");
      return;
    }

    if (!stock || Number.isNaN(stockNumber) || stockNumber < 0) {
      setFormError("Stock must be 0 or greater.");
      return;
    }

    const expected = expectedStatus(stockNumber);

    if (status !== expected) {
      setFormError(
        `The status should be "${expected}" based on the stock value.`,
      );
      return;
    }

    if (editingProduct) {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                name: trimmedName,
                price: priceNumber,
                category,
                stock: stockNumber,
                status,
              }
            : product,
        ),
      );

      setEditingProduct(null);
      setShowForm(false);
      resetForm();

      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      name: trimmedName,
      price: priceNumber,
      category,
      stock: stockNumber,
      status,
    };

    setProducts((prevProducts) => [...prevProducts, newProduct]);

    setShowForm(false);
    resetForm();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setDeletingProduct(null);

    setShowForm(true);

    setProductName(product.name);
    setPrice(String(product.price));
    setCategory(product.category);
    setStock(String(product.stock));
    setStatus(product.status);

    setFormError("");
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setEditingProduct(null);
    setShowForm(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;

    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== deletingProduct.id),
    );

    setDeletingProduct(null);
  };

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
            resetForm();
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 sm:w-auto"
        >
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="mb-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editingProduct ? "Edit Product" : "Create Product"}
          </h2>

          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm  outline-none transition  focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Price
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm  outline-none transition  focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                placeholder="Enter price"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ProductCategory | "")
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition  focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              >
                <option value="">Select category</option>
                <option value="Phone">Phone</option>
                <option value="Laptop">Laptop</option>
                <option value="Headphones">Headphones</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Stock
              </label>

              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition  focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                placeholder="Enter stock"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ProductStatus | "")
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition  focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              >
                <option value="">Select status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setEditingProduct(null);
                  setShowForm(false);
                }}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddProduct}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 sm:w-auto"
              >
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
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
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

export default ProductsPage;
