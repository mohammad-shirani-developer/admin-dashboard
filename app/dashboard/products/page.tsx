"use client";

import { useState } from "react";
import type { Product } from "../types";
import ProductsTable from "./components/ProductsTable";

const initialProducts: Product[] = [
  {
    id: 1,
    name: "MacBook Pro",
    price: 1999,
    category: "Laptop",
    stock: 12,
    status: "In Stock",
  },
  {
    id: 2,
    name: "iPhone 17",
    price: 999,
    category: "Phone",
    stock: 25,
    status: "In Stock",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5",
    price: 349,
    category: "Headphones",
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: 4,
    name: "Samsung Galaxy S26",
    price: 899,
    category: "Phone",
    stock: 8,
    status: "Low Stock",
  },
];

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("");
  const [formError, setFormError] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

    if (!productName.trim()) {
      setFormError("Product name is required.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setFormError("Price must be greater than 0.");
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

    if (Number(stock) === 0 && status === "In Stock") {
      setFormError("A product with 0 stock cannot be In Stock.");
      return;
    }

    if (editingProduct) {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                name: productName.trim(),
                price: Number(price),
                category,
                stock: Number(stock),
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
      name: productName.trim(),
      price: Number(price),
      category,
      stock: Number(stock),
      status,
    };

    setProducts((prevProducts) => [...prevProducts, newProduct]);

    setShowForm(false);
    setProductName("");
    setPrice("");
    setCategory("");
    setStock("");
    setStatus("");
    setFormError("");
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);

    setShowForm(true);

    setProductName(product.name);
    setPrice(String(product.price));
    setCategory(product.category);
    setStock(String(product.stock));
    setStatus(product.status);

    setFormError("");
  };

  return (
    <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add Product
        </button>

        <p className="mt-1 text-sm text-gray-500">
          {filteredProducts.length} products found
        </p>
      </div>

      {showForm && (
        <div className="mb-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editingProduct ? "Edit Product" : "Add Product"}
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
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
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
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                placeholder="Enter price"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
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
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                placeholder="Enter stock"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
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
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddProduct}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
            </div>
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
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:w-48"
        >
          <option value="All">All Categories</option>
          <option value="Laptop">Laptop</option>
          <option value="Phone">Phone</option>
          <option value="Headphones">Headphones</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
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
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Clear Filters
          </button>
        )}
      </div>

      <ProductsTable products={filteredProducts} onEdit={handleEditProduct} />
    </div>
  );
};

export default ProductsPage;
