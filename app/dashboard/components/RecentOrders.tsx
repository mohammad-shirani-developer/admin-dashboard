"use client";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type OrderStatus = "Paid" | "Pending" | "Cancelled";

type Order = {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: OrderStatus;
};

const orders: Order[] = [
  {
    id: "#1001",
    customer: "Ali",
    product: "Laptop",
    amount: "$999",
    status: "Paid",
  },
  {
    id: "#1002",
    customer: "Reza",
    product: "Smartphone",
    amount: "$699",
    status: "Pending",
  },
  {
    id: "#1003",
    customer: "Sara",
    product: "Headphones",
    amount: "$199",
    status: "Paid",
  },
  {
    id: "#1004",
    customer: "Mehdi",
    product: "Keyboard",
    amount: "$129",
    status: "Cancelled",
  },
];

const statusStyles: Record<OrderStatus, string> = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

const RecentOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedOrder(null);
      }
    };

    if (selectedOrder) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedOrder]);

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Orders</h2>

        <Link
          href="/dashboard/orders"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          View All
        </Link>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[700px]  text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 ">
              <th className=" px-4 py-3 font-medium">Order ID</th>
              <th className=" px-4 py-3 font-medium">Customer</th>
              <th className=" px-4 py-3 font-medium">Product</th>
              <th className=" px-4 py-3 font-medium">Amount</th>
              <th className=" px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3  font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100  transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-4 py-3">{order.customer}</td>
                  <td className="px-4 py-3">{order.product}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {order.amount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-5 ${statusStyles[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                      <ShoppingCart className="h-5 w-5 text-blue-500" />
                    </div>

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      No recent orders
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 lg:left-64"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-xl rounded-lg bg-white p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Order Details
              </h3>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-md px-2 py-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className="mt-4 divide-y divide-gray-100">
              <div className="py-3">
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {selectedOrder.id}
                </p>
              </div>

              <div className="py-3">
                <p className="text-xs text-gray-500">Customer</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {selectedOrder.customer}
                </p>
              </div>

              <div className="py-3">
                <p className="text-xs text-gray-500">Product</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {selectedOrder.product}
                </p>
              </div>

              <div className="py-3">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {selectedOrder.amount}
                </p>
              </div>

              <div className="py-3">
                <p className="text-xs text-gray-500">Status</p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-5 ${statusStyles[selectedOrder.status]}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="mt-5 w-full rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:w-auto"
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
