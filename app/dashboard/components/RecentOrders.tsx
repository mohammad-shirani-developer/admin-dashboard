"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatOrderId, formatUsd } from "../analytics";
import StatusBadge from "./StatusBadge";
import type { Order } from "../types";

type RecentOrdersProps = {
  orders: Order[];
};

const RecentOrders = ({ orders }: RecentOrdersProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /* Focus management: the close button takes focus when the dialog opens and
     the invoking "View Order" button gets it back when the dialog closes. */
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selectedOrder) {
      lastTriggerRef.current?.focus();
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedOrder(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedOrder]);

  const openDetails = (order: Order, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setSelectedOrder(order);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Orders
        </h2>

        <Link
          href="/dashboard/orders"
          className="rounded text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-offset-gray-900"
        >
          View All
        </Link>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <caption className="sr-only">
            Recent orders with customer, product, amount and status
          </caption>

          <thead>
            <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <th scope="col" className="px-4 py-3 font-medium">Order ID</th>
              <th scope="col" className="px-4 py-3 font-medium">Customer</th>
              <th scope="col" className="px-4 py-3 font-medium">Product</th>
              <th scope="col" className="px-4 py-3 font-medium">Amount</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                >
                  <td className="px-4 py-3 font-medium tabular-nums text-gray-900 dark:text-gray-100">
                    {formatOrderId(order.id)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {order.customer}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {order.product}
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums text-gray-900 dark:text-gray-100">
                    {formatUsd(order.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(event) =>
                        openDetails(order, event.currentTarget)
                      }
                      className="rounded text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-offset-gray-900"
                    >
                      View Order
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
                      <ShoppingCart
                        className="h-5 w-5 text-blue-500 dark:text-blue-400"
                        aria-hidden="true"
                      />
                    </div>

                    <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      No recent orders
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      There are no recent orders to display.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 lg:left-60"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="recent-order-details-title"
            className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3
                id="recent-order-details-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                Order Details
              </h3>

              <button
                type="button"
                ref={closeButtonRef}
                onClick={() => setSelectedOrder(null)}
                className="rounded-md px-2 py-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
              <div className="py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Order ID
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatOrderId(selectedOrder.id)}
                </p>
              </div>

              <div className="py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Customer
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedOrder.customer}
                </p>
              </div>

              <div className="py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Product
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedOrder.product}
                </p>
              </div>

              <div className="py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Amount
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                  {formatUsd(selectedOrder.amount)}
                </p>
              </div>

              <div className="py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <div className="mt-1">
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="mt-5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:focus-visible:ring-offset-gray-900 sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
