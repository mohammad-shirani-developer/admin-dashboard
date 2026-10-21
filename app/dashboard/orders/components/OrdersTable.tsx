"use client";

import { withClasses } from "@/app/components/ui/form-controls";
import { formatOrderId } from "../../analytics";
import StatusBadge from "../../components/StatusBadge";
import type { Order } from "../../types";

type OrdersTableProps = {
  orders: Order[];
  onView: (order: Order) => void;
};

const OrdersTable = ({ orders, onView }: OrdersTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
              ID
            </th>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
              Customer
            </th>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
              Date
            </th>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
              Total
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
          {orders.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400"
              >
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  No orders found
                </p>

                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filters.
                </p>
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                <td className="px-4 py-3 font-medium tabular-nums text-gray-900 dark:text-gray-100">
                  {formatOrderId(order.id)}
                </td>

                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {order.customer}
                </td>

                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {order.date}
                </td>

                <td className="px-4 py-3 font-medium tabular-nums text-gray-900 dark:text-gray-100">
                  ${Math.round(order.amount).toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    className={withClasses(
                      "rounded text-sm font-medium text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-offset-gray-900",
                    )}
                    onClick={() => onView(order)}
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

export default OrdersTable;
