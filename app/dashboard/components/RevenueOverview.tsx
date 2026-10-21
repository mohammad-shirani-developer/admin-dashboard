"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import FilterSelect from "@/app/components/ui/FilterSelect";
import { bucketOrdersByDay, formatAxisUsd, formatUsd } from "../analytics";
import type { Order } from "../types";
import { chartTickStyle, useChartTheme } from "./chart-theme";

type RevenueOverviewProps = {
  orders: Order[];
  /** Window length in days, controlled by the page header chip. */
  days: number;
  /** Optional inverse control so the card header mirrors the page chip. */
  onDaysChange?: (days: number) => void;
  rangeOptions?: ReadonlyArray<{ value: string; label: string }>;
};

const RevenueOverview = ({
  orders,
  days,
  onDaysChange,
  rangeOptions,
}: RevenueOverviewProps) => {
  const chartTheme = useChartTheme();

  const data = useMemo(() => bucketOrdersByDay(orders, days), [orders, days]);

  return (
    <section className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Revenue Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Revenue per day from real cart totals
          </p>
        </div>

        {onDaysChange && rangeOptions && (
          <FilterSelect
            ariaLabel="Select revenue overview window"
            value={String(days)}
            options={rangeOptions}
            onChange={(value) => onDaysChange(Number(value))}
            className="sm:w-36"
          />
        )}
      </div>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartTheme.gridStroke}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={chartTickStyle(chartTheme)}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatAxisUsd(Number(value))}
              tick={chartTickStyle(chartTheme)}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip
              contentStyle={chartTheme.tooltipContentStyle}
              labelStyle={chartTheme.tooltipLabelStyle}
              itemStyle={chartTheme.tooltipItemStyle}
              cursor={{ stroke: chartTheme.cursorStroke, strokeWidth: 1 }}
              formatter={(value) => [formatUsd(Number(value)), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default RevenueOverview;
