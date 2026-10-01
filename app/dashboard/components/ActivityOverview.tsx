const activities = [
  {
    id: 1,
    title: "New user registered",
    description: "Ali created a new account",
    time: "5 min ago",
    type: "user",
  },
  {
    id: 2,
    title: "New order received",
    description: "Order #1004 was placed",
    time: "20 min ago",
    type: "order",
  },
  {
    id: 3,
    title: "Product updated",
    description: "Laptop product was updated",
    time: "1 hour ago",
    type: "product",
  },
  {
    id: 4,
    title: "Payment received",
    description: "Payment for order #1002 was received",
    time: "2 hours ago",
    type: "payment",
  },
];

const ActivityOverview = () => {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Recent Activity</h2>

      <div className="mt-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex flex-col gap-2 border-b border-gray-100 py-4 sm:flex-row sm:items-center sm:justify-between last:border-b-0"
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                  activity.type === "user"
                    ? "bg-green-500"
                    : activity.type === "order"
                      ? "bg-blue-500"
                      : activity.type === "product"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                }`}
              />

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {activity.description}
                </p>
              </div>
            </div>

            <span className="shrink-0 text-xs text-gray-400">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityOverview;
