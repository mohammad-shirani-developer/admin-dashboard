import { CreditCard, Package, ShoppingCart, UserPlus } from "lucide-react";

type ActivityType = "user" | "order" | "product" | "payment";

type Activity = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: ActivityType;
  icon: React.ElementType;
};
const activities: Activity[] = [
  {
    id: 1,
    title: "New user registered",
    description: "Ali created a new account",
    time: "5 min ago",
    type: "user",
    icon: UserPlus,
  },
  {
    id: 2,
    title: "New order received",
    description: "Order #1004 was placed",
    time: "20 min ago",
    type: "order",
    icon: ShoppingCart,
  },
  {
    id: 3,
    title: "Product updated",
    description: "Laptop product was updated",
    time: "1 hour ago",
    type: "product",
    icon: Package,
  },
  {
    id: 4,
    title: "Payment received",
    description: "Payment for order #1002 was received",
    time: "2 hours ago",
    type: "payment",
    icon: CreditCard,
  },
];

const activityStyles = {
  user: {
    background: "bg-green-100",
    icon: "text-green-600",
  },
  order: {
    background: "bg-blue-100",
    icon: "text-blue-600",
  },
  product: {
    background: "bg-yellow-100",
    icon: "text-yellow-600",
  },
  payment: {
    background: "bg-purple-100",
    icon: "text-purple-600",
  },
};

const ActivityOverview = () => {
  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Recent Activity</h2>

      <div className="mt-4 flex flex-1 flex-col justify-between">
        {activities.map((activity) => {
          const style = activityStyles[activity.type];
          return (
            <div
              key={activity.id}
              className="flex flex-col gap-2 border-b border-gray-100 py-3 sm:flex-row sm:items-center sm:justify-between last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.background}`}
                >
                  <activity.icon className={`h-4 w-4 ${style.icon}`} />
                </div>
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
          );
        })}
      </div>
    </div>
  );
};

export default ActivityOverview;
