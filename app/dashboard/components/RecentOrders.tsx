import Link from "next/link";

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
            {orders.map((order) => (
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
                  <Link
                    href={`/dashboard/orders`}
                    className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                  >
                    View Order
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
