"use client";
import { useState } from "react";
import { initialOrders } from "../data/ordersData";
import type { Order } from "../types";
import OrdersTable from "./components/OrdersTable";

const OrderPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders = initialOrders.filter((order) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      order.customer.toLowerCase().includes(searchValue) ||
      order.product.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>

        <p className="mt-1 text-sm text-gray-500">
          {filteredOrders.length} orders found
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by customer or product..."
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:flex-1"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:w-auto"
        >
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:w-auto"
        >
          Clear Filters
        </button>
      </div>

      <OrdersTable
        orders={filteredOrders}
        onView={(order) => setSelectedOrder(order)}
      />

      {selectedOrder && (
        <div className="mt-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Order Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Order #{selectedOrder.id}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2  lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Customer</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {selectedOrder.customer}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Product</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {selectedOrder.product}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Amount</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                ${selectedOrder.amount.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Date</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {selectedOrder.date}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Status</p>
              <span
                className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                  selectedOrder.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : selectedOrder.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {selectedOrder.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
