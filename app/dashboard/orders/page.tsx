"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import FilterSelect from "@/app/components/ui/FilterSelect";
import {
  inputClasses,
  secondaryButtonClasses,
  withClasses,
} from "@/app/components/ui/form-controls";
import ErrorState from "../components/ErrorState";
import TableSkeleton from "../components/TableSkeleton";
import { fetchOrders } from "@/app/lib/api";
import type { Order, OrderStatus } from "../types";
import StatusBadge from "../components/StatusBadge";
import OrdersTable from "./components/OrdersTable";

type OrderStatusFilter = "All" | OrderStatus;

const ORDER_STATUS_OPTIONS: ReadonlyArray<{
  value: OrderStatusFilter;
  label: string;
}> = [
  { value: "All", label: "All Statuses" },
  { value: "Delivered", label: "Delivered" },
  { value: "Processing", label: "Processing" },
  { value: "Pending", label: "Pending" },
  { value: "Cancelled", label: "Cancelled" },
];

const OrdersPage = () => {
  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("All");

  const filteredOrders = useMemo(() => {
    const searchValue = search.toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        order.customer.toLowerCase().includes(searchValue) ||
        order.product.toLowerCase().includes(searchValue) ||
        String(order.id).includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
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
          className={withClasses(inputClasses, "sm:flex-1")}
        />
        <FilterSelect
          ariaLabel="Filter by status"
          value={statusFilter}
          options={ORDER_STATUS_OPTIONS}
          onChange={setStatusFilter}
          className="sm:w-auto"
        />
        {(search || statusFilter !== "All") && (
          <button
            type="button"
            onClick={clearFilters}
            className={withClasses(secondaryButtonClasses, "w-full sm:w-auto")}
          >
            Clear Filters
          </button>
        )}
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
              className={withClasses(secondaryButtonClasses, "px-3 py-2")}
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
                ${Math.round(selectedOrder.amount).toLocaleString()}
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
              <div className="mt-1">
                <StatusBadge status={selectedOrder.status} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
