import type { Customer, CustomerStatus } from "../../types";

type CustomersTableProps = {
  customers: Customer[];
  onView: (customer: Customer) => void;
};

const statusStyles: Record<CustomerStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
};

const CustomersTable = ({ customers, onView }: CustomersTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-600">Customer</th>

            <th className="px-4 py-3 font-medium text-gray-600">Email</th>

            <th className="px-4 py-3 font-medium text-gray-600">Orders</th>

            <th className="px-4 py-3 font-medium text-gray-600">Total Spent</th>

            <th className="px-4 py-3 font-medium text-gray-600">Status</th>

            <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-gray-700">
                    No customers found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filters.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {customer.name}
                </td>

                <td className="px-4 py-3 text-gray-600">{customer.email}</td>

                <td className="px-4 py-3 text-gray-600">{customer.orders}</td>

                <td className="px-4 py-3 font-medium text-gray-900">
                  ${customer.totalSpent.toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[customer.status]}`}
                  >
                    {customer.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
