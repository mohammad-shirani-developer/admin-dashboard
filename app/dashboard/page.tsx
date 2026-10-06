import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import ActivityOverview from "./components/ActivityOverview";
import RecentOrders from "./components/RecentOrders";
import SalesOverview from "./components/SalesOverview";
import StatCard from "./components/StatCard";
import { salesData, stats } from "./data/dashboardData";

const statIcons = {
  users: <Users className="h-5 w-5 text-gray-600" />,
  products: <Package className="h-5 w-5 text-gray-600" />,
  orders: <ShoppingCart className="h-5 w-5 text-gray-600" />,
  revenue: <DollarSign className="h-5 w-5 text-gray-600" />,
};

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
            icon={statIcons[stat.id as keyof typeof statIcons]}
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
