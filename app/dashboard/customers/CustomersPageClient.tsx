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
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import TableSkeleton from "../components/TableSkeleton";
import { fetchCustomers } from "@/app/lib/api";
import type { Customer, CustomerStatus } from "../types";
import CustomersTable from "./components/CustomersTable";

type CustomerStatusFilter = "All" | CustomerStatus;

const CUSTOMER_STATUS_OPTIONS: ReadonlyArray<{
  value: CustomerStatusFilter;
  label: string;
}> = [
  { value: "All", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const CUSTOMERS_PAGE_SIZE = 8;

const CustomersPage = () => {
  const {
    data: customers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>("All");

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        const searchValue = search.toLowerCase();

        const matchesSearch =
          customer.name.toLowerCase().includes(searchValue) ||
          customer.email.toLowerCase().includes(searchValue);

        const matchesStatus =
          statusFilter === "All" || customer.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [customers, search, statusFilter],
  );

  const {
    page,
    pageCount,
    pageItems: pageCustomers,
    setPage,
    totalItems,
  } = usePagination(filteredCustomers, CUSTOMERS_PAGE_SIZE);

  // Every filter change sends the user back to the first page.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: CustomerStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    handleSearchChange("");
    handleStatusChange("All");
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
    <div className="mx-4 mt-6 pb-6 sm:mx-6 lg:mx-8">
      <div className="mb-5 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Customers
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filteredCustomers.length} customers found
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search by name or email..."
          className={withClasses(inputClasses, "sm:flex-1")}
        />

        <FilterSelect
          ariaLabel="Filter by status"
          value={statusFilter}
          options={CUSTOMER_STATUS_OPTIONS}
          onChange={handleStatusChange}
          className="sm:w-40"
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

      {selectedCustomer && (
        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Customer Details
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Customer #{selectedCustomer.id}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className={withClasses(secondaryButtonClasses, "px-3 py-2")}
            >
              Close
            </button>
          </div>

          <div className="mt-5 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="py-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Name
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedCustomer.name}
              </p>
            </div>

            <div className="py-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Email
              </p>

              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {selectedCustomer.email}
              </p>
            </div>

            <div className="py-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Orders
              </p>

              <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900 dark:text-white">
                {selectedCustomer.orders}
              </p>
            </div>

            <div className="py-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Spent
              </p>

              <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900 dark:text-white">
                ${Math.round(selectedCustomer.totalSpent).toLocaleString()}
              </p>
            </div>

            <div className="py-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Status
              </p>

              <div className="mt-1">
                <StatusBadge status={selectedCustomer.status} />
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomersTable
        customers={pageCustomers}
        onView={(customer) => setSelectedCustomer(customer)}
      />

      <Pagination
        page={page}
        pageCount={pageCount}
        totalItems={totalItems}
        pageSize={CUSTOMERS_PAGE_SIZE}
        itemLabel="customers"
        onPageChange={setPage}
      />
    </div>
  );
};

export default CustomersPage;
