"use client";

import Avatar from "@/app/components/ui/Avatar";
import StatusBadge from "../../components/StatusBadge";
import type { Customer } from "../../types";

type CustomersTableProps = {
  customers: Customer[];
  onView: (customer: Customer) => void;
};

const CustomersTable = ({ customers, onView }: CustomersTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
              Customer
            </th>

            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
              Email
            </th>

            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
              Orders
            </th>

            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
              Total Spent
            </th>

            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
              Status
            </th>

            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {customers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    No customers found
                  </p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filters.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr
                key={customer.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={customer.image} name={customer.name} />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {customer.name}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {customer.email}
                </td>

                <td className="px-4 py-3 tabular-nums text-gray-600 dark:text-gray-400">
                  {customer.orders}
                </td>

                <td className="px-4 py-3 font-medium tabular-nums text-gray-900 dark:text-gray-100">
                  ${Math.round(customer.totalSpent).toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={customer.status} />
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="rounded text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-offset-gray-900"
                    onClick={() => onView(customer)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersTable;
