"use client";
import { useState } from "react";
import { initialCustomers } from "../data/customersData";
import type { Customer } from "../types";
import CustomersTable from "./components/CustomersTable";

const CustomersPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const filteredCustomers = initialCustomers.filter((customer) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      customer.name.toLowerCase().includes(searchValue) ||
      customer.email.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
      <div className="mb-5 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>

        <p className="text-sm text-gray-500">
          {filteredCustomers.length} customers found
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:flex-1"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:w-auto"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {(search || statusFilter !== "All") && (
          <button
            type="button"
            onClick={clearFilters}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:w-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {selectedCustomer && (
        <div className="mb-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Customer Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Customer #{selectedCustomer.id}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Name</p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {selectedCustomer.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Email</p>

              <p className="mt-1 text-sm text-gray-900">
                {selectedCustomer.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Orders</p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {selectedCustomer.orders}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Total Spent</p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                ${selectedCustomer.totalSpent.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Status</p>

              <span
                className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                  selectedCustomer.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {selectedCustomer.status}
              </span>
            </div>
          </div>
        </div>
      )}

      <CustomersTable
        customers={filteredCustomers}
        onView={(customer) => setSelectedCustomer(customer)}
      />
    </div>
  );
};

export default CustomersPage;
