import type { Order, OrderStatus } from "../../types";

type OrdersTableProps = {
  orders: Order[];
  onView: (order: Order) => void;
};

const statusStyles: Record<OrderStatus, string> = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

const OrdersTable = ({ orders, onView }: OrdersTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-600">Order ID</th>
            <th className="px-4 py-3 font-medium text-gray-600">Customer</th>
            <th className="px-4 py-3 font-medium text-gray-600">Product</th>
            <th className="px-4 py-3 font-medium text-gray-600">Amount</th>
            <th className="px-4 py-3 font-medium text-gray-600">Date</th>
            <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-gray-700">
                    No orders found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  #{order.id}
                </td>

                <td className="px-4 py-3 text-gray-700">{order.customer}</td>

                <td className="px-4 py-3 text-gray-700">{order.product}</td>

                <td className="px-4 py-3 text-gray-700">
                  ${order.amount.toLocaleString()}
                </td>

                <td className="px-4 py-3 text-gray-500">{order.date}</td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
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
