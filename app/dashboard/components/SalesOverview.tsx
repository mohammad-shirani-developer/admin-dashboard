"use client";

import { AlertCircle, BarChart3 } from "lucide-react";
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
  const [hasError, setHasError] = useState(false);

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

          {isLoading ? (
            <div className="mt-3 h-8 w-32 animate-pulse rounded-md bg-gray-100" />
          ) : (
            <p className="mt-3 text-2xl font-semibold text-gray-900">
              ${totalSales.toLocaleString()}
            </p>
          )}

          <p className="mt-1 text-xs text-gray-500">Total Sales</p>
        </div>

        <select
          value={range}
          disabled={isLoading}
          onChange={(event) => {
            setIsLoading(true);
            setRange(event.target.value);
            setTimeout(() => {
              setIsLoading(false);
            }, 300);
          }}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <option value="3">Last 3 Months</option>
          <option value="6">Last 6 Months</option>
          <option value="12">This Year</option>
        </select>
      </div>

      <div className="mt-5 h-80">
        {isLoading ? (
          <div className="relative h-full animate-pulse px-8 pb-8 pt-4">
            <div className="absolute bottom-8 left-8 top-4 w-px bg-gray-200" />

            <div className="absolute bottom-8 left-8 right-0 h-px bg-gray-200" />

            <div className="absolute bottom-[25%] left-8 right-0 border-t border-dashed border-gray-100" />

            <div className="absolute bottom-[50%] left-8 right-0 border-t border-dashed border-gray-100" />

            <div className="absolute bottom-[75%] left-8 right-0 border-t border-dashed border-gray-100" />

            <div className="absolute bottom-[28%] left-[18%] h-2 w-2 rounded-full bg-gray-300" />
            <div className="absolute bottom-[45%] left-[32%] h-2 w-2 rounded-full bg-gray-300" />
            <div className="absolute bottom-[38%] left-[46%] h-2 w-2 rounded-full bg-gray-300" />
            <div className="absolute bottom-[62%] left-[60%] h-2 w-2 rounded-full bg-gray-300" />
            <div className="absolute bottom-[70%] left-[74%] h-2 w-2 rounded-full bg-gray-300" />
            <div className="absolute bottom-[78%] left-[88%] h-2 w-2 rounded-full bg-gray-300" />
          </div>
        ) : hasError ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>

            <p className="mt-3 text-sm font-medium text-gray-700">
              Unable to load sales data
            </p>

            <p className="mt-1 max-w-xs text-xs text-gray-500">
              Something went wrong while loading sales data.
            </p>

            <button
              type="button"
              onClick={() => {
                setHasError(false);
                setIsLoading(true);

                setTimeout(() => {
                  setIsLoading(false);
                }, 500);
              }}
              className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Try Again
            </button>
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
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>

            <p className="mt-3 text-sm font-medium text-gray-700">
              No sales data available
            </p>

            <p className="mt-1 max-w-xs text-xs text-gray-500">
              There is no sales data available for the selected period.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOverview;
