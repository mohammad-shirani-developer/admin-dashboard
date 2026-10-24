"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import FilterSelect from "@/app/components/ui/FilterSelect";
import {
  inputClasses,
  secondaryButtonClasses,
  withClasses,
} from "@/app/components/ui/form-controls";
import Pagination from "@/app/components/ui/Pagination";
import usePagination from "@/app/hooks/usePagination";
import { formatOrderId, formatUsd } from "../analytics";
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import TableSkeleton from "../components/TableSkeleton";
import { fetchOrders } from "@/app/lib/api";
import type { Order, OrderStatus } from "../types";
import OrdersTable from "./components/OrdersTable";

type OrderStatusFilter = "All" | OrderStatus;
type OrderSort = "newest" | "oldest" | "total-desc" | "total-asc";

const ORDER_STATUS_OPTIONS: ReadonlyArray<{
  value: OrderStatusFilter;
  label: string;
}> = [
  { value: "All", label: "All Status" },
  { value: "Delivered", label: "Delivered" },
  { value: "Processing", label: "Processing" },
  { value: "Pending", label: "Pending" },
  { value: "Cancelled", label: "Cancelled" },
];

const ORDER_SORT_OPTIONS: ReadonlyArray<{ value: OrderSort; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "total-desc", label: "Total: High to Low" },
  { value: "total-asc", label: "Total: Low to High" },
];

const ORDERS_PAGE_SIZE = 10;

const OrdersPage = () => {
  const {
    data: orders = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("All");
  const [sort, setSort] = useState<OrderSort>("newest");

  const filteredOrders = useMemo(() => {
    const searchValue = search.toLowerCase();

    const matches = orders.filter((order) => {
      /* The table displays #1001-style ids, so searching must match the
         DISPLAYED id ("1005"/"#1005"), not just the raw cart id ("5"). */
      const displayedId = formatOrderId(order.id).toLowerCase();
      const rawId = String(order.id);
      const matchesSearch =
        order.customer.toLowerCase().includes(searchValue) ||
        order.product.toLowerCase().includes(searchValue) ||
        rawId.includes(searchValue) ||
        displayedId.includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    const sorted = [...matches];

    switch (sort) {
      case "oldest":
        return sorted.sort((a, b) => a.id - b.id);
      case "total-desc":
        return sorted.sort((a, b) => b.amount - a.amount);
      case "total-asc":
        return sorted.sort((a, b) => a.amount - b.amount);
      default:
        return sorted.sort((a, b) => b.id - a.id);
    }
  }, [orders, search, statusFilter, sort]);

  const {
    page,
    pageCount,
    pageItems: pageOrders,
    setPage,
    totalItems,
  } = usePagination(filteredOrders, ORDERS_PAGE_SIZE);

  // Every filter/sort change sends the user back to the first page.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: OrderStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSortChange = (value: OrderSort) => {
    setSort(value);
    setPage(1);
  };

  const clearFilters = () => {
    handleSearchChange("");
    handleStatusChange("All");
    handleSortChange("newest");
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
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Orders
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage customer orders
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search by customer or product..."
          className={withClasses(inputClasses, "sm:flex-1")}
        />
        <FilterSelect
          ariaLabel="Filter by status"
          value={statusFilter}
          options={ORDER_STATUS_OPTIONS}
          onChange={handleStatusChange}
          className="sm:w-40"
        />
        <FilterSelect
          ariaLabel="Sort orders"
          value={sort}
          options={ORDER_SORT_OPTIONS}
          onChange={handleSortChange}
          className="sm:w-52"
        />
        {(search || statusFilter !== "All" || sort !== "newest") && (
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
        orders={pageOrders}
        onView={(order) => setSelectedOrder(order)}
      />

      <Pagination
        page={page}
        pageCount={pageCount}
        totalItems={totalItems}
        pageSize={ORDERS_PAGE_SIZE}
        itemLabel="orders"
        onPageChange={setPage}
      />

      {selectedOrder && (
        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Details
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Order {formatOrderId(selectedOrder.id)}
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

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Customer
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedOrder.customer}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Product
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedOrder.product}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900 dark:text-white">
                {formatUsd(selectedOrder.amount)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Date
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedOrder.date}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Status
              </p>
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
