import StatCard from "./components/StatCard";

const stats = [
  {
    id: "users",
    title: "Total Users",
    value: 1240,
    change: "+5%",
  },
  {
    id: "products",
    title: "Total Products",
    value: 86,
    change: "-2%",
  },
  {
    id: "orders",
    title: "Total Orders",
    value: 324,
  },
  {
    id: "revenue",
    title: "Revenue",
    value: "$12,450",
    change: "+10%",
  },
];

const DashboardPage = () => {
  return (
    <div className="mx-4 mt-6 grid grid-cols-1 gap-5 sm:mx-6 sm:grid-cols-2 lg:mx-8 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          change={stat.change}
        />
      ))}
    </div>
  );
};

export default DashboardPage;
