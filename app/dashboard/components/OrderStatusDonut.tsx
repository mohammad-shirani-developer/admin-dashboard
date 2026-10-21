"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { useMemo } from "react";
import { orderStatusDistribution } from "../analytics";
import type { Order, OrderStatus } from "../types";
import { useChartTheme } from "./chart-theme";

/** Donut hues from the mockup: emerald/blue/amber/red status palette. */
const STATUS_COLORS: Record<OrderStatus, string> = {
  Delivered: "#10b981",
  Processing: "#3b82f6",
  Pending: "#f59e0b",
  Cancelled: "#ef4444",
};

type OrderStatusDonutProps = {
  orders: Order[];
};

const OrderStatusDonut = ({ orders }: OrderStatusDonutProps) => {
  const chartTheme = useChartTheme();
  const slices = useMemo(() => orderStatusDistribution(orders), [orders]);
  const total = orders.length;

  return (
    <section className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Order Status
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Distribution of order statuses
        </p>
      </div>

      {slices.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No orders yet.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-5">
          {/* Fixed 176px box: the donut SSRs with the prefetched cache (no
              ResponsiveContainer measurement needed), so the chart svg is
              present in the server HTML. */}
          <div className="relative h-44 w-44 shrink-0">
            <PieChart width={176} height={176}>
              <Pie
                data={slices}
                dataKey="count"
                nameKey="status"
                innerRadius="70%"
                outerRadius="100%"
                cornerRadius={4}
                paddingAngle={2}
                strokeWidth={0}
                isAnimationActive={false}
              >
                {slices.map((slice) => (
                  <Cell
                    key={slice.status}
                    fill={STATUS_COLORS[slice.status]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTheme.tooltipContentStyle}
                labelStyle={chartTheme.tooltipLabelStyle}
                itemStyle={chartTheme.tooltipItemStyle}
                formatter={(value) => [String(value), "Orders"]}
              />
            </PieChart>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                {total.toLocaleString()}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Orders
              </p>
            </div>
          </div>

          <ul className="w-full max-w-[240px] space-y-2.5">
            {slices.map((slice) => (
              <li
                key={slice.status}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[slice.status] }}
                    aria-hidden="true"
                  />
                  <span className="text-gray-600 dark:text-gray-300">
                    {slice.status}
                  </span>
                </span>
                <span className="font-medium tabular-nums text-gray-900 dark:text-white">
                  {slice.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default OrderStatusDonut;
