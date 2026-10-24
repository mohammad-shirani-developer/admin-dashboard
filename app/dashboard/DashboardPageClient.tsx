"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Calendar, DollarSign, ShoppingCart, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { chipSelectClasses } from "@/app/components/ui/form-controls";
import { fetchOrders, fetchProducts, fetchUsers } from "@/app/lib/api";
import {
  daysAgoFromDateString,
  formatTrendPercent,
} from "./analytics";
import ErrorState from "./components/ErrorState";
import OrderStatusDonut from "./components/OrderStatusDonut";
import RecentOrders from "./components/RecentOrders";
import RevenueOverview from "./components/RevenueOverview";
import StatCard from "./components/StatCard";
import TableSkeleton from "./components/TableSkeleton";
import TopProducts from "./components/TopProducts";

type RevenueRange = "7" | "30";

const RANGE_OPTIONS: ReadonlyArray<{ value: RevenueRange; label: string }> = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];

const REAL_TREND_TITLE =
  "Week-over-week change derived from real order dates";

const statMeta = {
  products: {
    icon: <Box className="h-5 w-5" aria-hidden="true" />,
    iconClassName:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  orders: {
    icon: <ShoppingCart className="h-5 w-5" aria-hidden="true" />,
    iconClassName:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  users: {
    icon: <Users className="h-5 w-5" aria-hidden="true" />,
    iconClassName:
      "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
  revenue: {
    icon: <DollarSign className="h-5 w-5" aria-hidden="true" />,
    iconClassName:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
} as const;

const DashboardPage = () => {
  const [range, setRange] = useState<RevenueRange>("7");

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const isLoading =
    productsQuery.isLoading || ordersQuery.isLoading || usersQuery.isLoading;
  const isError =
    productsQuery.isError || ordersQuery.isError || usersQuery.isError;

  const retryAll = () => {
    void productsQuery.refetch();
    void ordersQuery.refetch();
    void usersQuery.refetch();
  };

  const stats = useMemo(() => {
    const products = productsQuery.data ?? [];
    const orders = ordersQuery.data ?? [];
    const users = usersQuery.data ?? [];

    const revenue = orders.reduce((sum, order) => sum + order.amount, 0);

    const ordersLast7 = orders.filter((order) => {
      const daysAgo = daysAgoFromDateString(order.date);
      return daysAgo >= 0 && daysAgo < 7;
    });
    const ordersPrevious7 = orders.filter((order) => {
      const daysAgo = daysAgoFromDateString(order.date);
      return daysAgo >= 7 && daysAgo < 14;
    });

    const revenueLast7 = ordersLast7.reduce((sum, order) => sum + order.amount, 0);
    const revenuePrevious7 = ordersPrevious7.reduce(
      (sum, order) => sum + order.amount,
      0,
    );

    // Trends are only shown where the data supports them: orders and revenue
    // have real derived dates to compare week-over-week. Products and users
    // carry no history in the API, so their cards omit the trend row entirely
    // instead of fabricating one.
    const ordersTrend = formatTrendPercent(
      ordersLast7.length,
      ordersPrevious7.length,
    );
    const revenueTrend = formatTrendPercent(revenueLast7, revenuePrevious7);

    // Card order mirrors the mockup: Products, Orders, Users, Revenue.
    return [
      {
        id: "products" as const,
        title: "Total Products",
        value: products.length.toLocaleString(),
        change: undefined,
      },
      {
        id: "orders" as const,
        title: "Total Orders",
        value: orders.length.toLocaleString(),
        change: ordersTrend ?? undefined,
      },
      {
        id: "users" as const,
        title: "Total Users",
        value: users.length.toLocaleString(),
        change: undefined,
      },
      {
        id: "revenue" as const,
        title: "Total Revenue",
        value: `$${Math.round(revenue).toLocaleString()}`,
        change: revenueTrend ?? undefined,
      },
    ];
  }, [productsQuery.data, ordersQuery.data, usersQuery.data]);

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);

  const latestOrders = useMemo(
    () => [...orders].sort((a, b) => b.id - a.id).slice(0, 5),
    [orders],
  );

  if (isLoading) {
    return (
      <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
        <TableSkeleton minHeight="min-h-[480px]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
        <ErrorState
          onRetry={retryAll}
          retrying={
            productsQuery.isFetching ||
            ordersQuery.isFetching ||
            usersQuery.isFetching
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-4 mt-6 pb-6 sm:mx-6 lg:mx-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your store
          </p>
        </div>

        {/* Bordered chip from the mockup: Calendar icon + a real range select. */}
        <div className="flex w-fit items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Calendar
            className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
          <select
            aria-label="Select revenue chart range"
            value={range}
            onChange={(event) => setRange(event.target.value as RevenueRange)}
            className={chipSelectClasses}
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeTitle={stat.change ? REAL_TREND_TITLE : undefined}
            icon={statMeta[stat.id].icon}
            iconClassName={statMeta[stat.id].iconClassName}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <div className="lg:col-span-2">
          <RevenueOverview
            orders={orders}
            days={Number(range)}
            onDaysChange={(days) => setRange(days === 30 ? "30" : "7")}
            rangeOptions={RANGE_OPTIONS}
          />
        </div>

        <TopProducts orders={orders} />

        <OrderStatusDonut orders={orders} />
      </div>

      <div className="mt-6">
        <RecentOrders orders={latestOrders} />
      </div>
    </div>
  );
};

export default DashboardPage;
