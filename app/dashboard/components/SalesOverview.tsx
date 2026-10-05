"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SalesOverviewProps = {
  data: {
    month: string;
    sales: number;
  }[];
};

const SalesOverview = ({ data }: SalesOverviewProps) => {
  const [range, setRange] = useState("6");
  const [isLoading, setIsLoading] = useState(false);

  const filteredData = data.slice(-Number(range));

  const totalSales = filteredData.reduce(
    (total, item) => total + item.sales,
    0,
  );

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Sales Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Monthly sales performance
          </p>

          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {isLoading ? "Loading..." : `$${totalSales.toLocaleString()}`}
          </p>

          <p className="mt-1 text-xs text-gray-500">Total Sales</p>
        </div>

        <select
          value={range}
          onChange={(event) => {
            setIsLoading(true);
            setRange(event.target.value);
            setTimeout(() => {
              setIsLoading(false);
            }, 300);
          }}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none sm:w-auto"
        >
          <option value="3">Last 3 Months</option>
          <option value="6">Last 6 Months</option>
          <option value="12">This Year</option>
        </select>
      </div>

      <div className="mt-5 h-80">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Loading sales data...
          </div>
        ) : filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No sales data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOverview;
