import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import ActivityOverview from "./components/ActivityOverview";
import RecentOrders from "./components/RecentOrders";
import SalesOverview from "./components/SalesOverview";
import StatCard from "./components/StatCard";

const stats = [
  {
    id: "users",
    title: "Total Users",
    value: 1240,
    change: "+5%",
    icon: <Users className="h-5 w-5 text-gray-600" />,
  },
  {
    id: "products",
    title: "Total Products",
    value: 86,
    change: "-2%",
    icon: <Package className="h-5 w-5 text-gray-600" />,
  },
  {
    id: "orders",
    title: "Total Orders",
    value: 324,
    icon: <ShoppingCart className="h-5 w-5 text-gray-600" />,
  },
  {
    id: "revenue",
    title: "Revenue",
    value: "$12,450",
    change: "+10%",
    icon: <DollarSign className="h-5 w-5 text-gray-600" />,
  },
];

const salesData = [
  { month: "Jan", sales: 1800 },
  { month: "Feb", sales: 2400 },
  { month: "Mar", sales: 2100 },
  { month: "Apr", sales: 3200 },
  { month: "May", sales: 2800 },
  { month: "Jun", sales: 3600 },
];

const DashboardPage = () => {
  return (
    <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>
      <div className="mt-3">
        <RecentOrders />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesOverview data={salesData} />
        <ActivityOverview />
      </div>
    </div>
  );
};

export default DashboardPage;
