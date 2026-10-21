"use client";

import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { formatUsd, topProductsByQuantity } from "../analytics";
import type { Order } from "../types";

type TopProductsProps = {
  orders: Order[];
};

const TopProducts = ({ orders }: TopProductsProps) => {
  const topProducts = useMemo(() => topProductsByQuantity(orders, 5), [orders]);
  const maxSold = topProducts[0]?.sold ?? 0;

  return (
    <section className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Products
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Best sellers by units sold
          </p>
        </div>

        <Link
          href="/dashboard/products"
          className="rounded text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-offset-gray-900"
        >
          View all
        </Link>
      </div>

      {topProducts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
            <Package className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </div>

          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            No sales yet
          </p>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Sold quantities will appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-1 flex-col justify-around gap-4">
          {topProducts.map((product) => (
            <li key={product.productId} className="flex items-center gap-3">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Package className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {product.title}
                  </p>

                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {formatUsd(product.price)}
                  </span>
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${
                        maxSold > 0
                          ? Math.max((product.sold / maxSold) * 100, 4)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <span className="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                {product.sold} sold
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default TopProducts;
