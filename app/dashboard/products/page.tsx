"use client";
import { useState } from "react";
import type { Product } from "../types";
import ProductsTable from "./components/ProductsTable";

const products: Product[] = [
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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

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

  return (
    <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Products</h1>
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
      </div>

      <ProductsTable products={filteredProducts} />
    </div>
  );
};

export default ProductsPage;
