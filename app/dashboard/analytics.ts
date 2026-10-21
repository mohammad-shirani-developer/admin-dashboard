import type { Order, OrderStatus } from "./types";

/**
 * Pure, deterministic derivations shared by the dashboard widgets. Everything
 * is computed from the real DummyJSON data (carts joined to users) — the
 * pseudo dates come from `deriveOrderDate` in lib/api.ts.
 */

const MS_PER_DAY = 86_400_000;

/** Days between the start of today and a YYYY-MM-DD date string. */
export const daysAgoFromDateString = (
  dateString: string,
  now: Date = new Date(),
): number => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((startOfToday.getTime() - date.getTime()) / MS_PER_DAY);
};

/** Human label for a day offset ("Today", "Yesterday", "5 days ago"). */
export const timeAgoLabel = (daysAgo: number): string => {
  if (daysAgo <= 0) {
    return "Today";
  }
  if (daysAgo === 1) {
    return "Yesterday";
  }
  return `${daysAgo} days ago`;
};

export const formatUsd = (value: number): string =>
  `$${Math.round(value).toLocaleString()}`;

/**
 * Display-only order id (#1001-style): cart ids are small sequential numbers,
 * so the UI offsets them by 1000. Real ids in the data layer stay untouched.
 */
export const formatOrderId = (id: number): string => `#${id + 1000}`;

/** Compact $ label for chart axes ("$12.5K"). */
export const formatAxisUsd = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    const thousands = value / 1000;
    return `$${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`;
  }
  return `$${value}`;
};

export type DayBucket = {
  /** Bucket index 0 = oldest day of the range, last = today. */
  label: string;
  revenue: number;
  orders: number;
};

/**
 * Buckets orders into the last `days` days (including today) by their derived
 * pseudo date. Days without orders are zero-filled so charts keep a
 * continuous axis.
 */
export const bucketOrdersByDay = (
  orders: Order[],
  days: number,
  now: Date = new Date(),
): DayBucket[] => {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const buckets: DayBucket[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(startOfToday);
    date.setDate(date.getDate() - offset);
    buckets.push({
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: 0,
      orders: 0,
    });
  }

  for (const order of orders) {
    const daysAgo = daysAgoFromDateString(order.date, now);
    if (daysAgo >= 0 && daysAgo < days) {
      const bucket = buckets[days - 1 - daysAgo];
      bucket.revenue += order.amount;
      bucket.orders += 1;
    }
  }

  return buckets.map((bucket) => ({
    ...bucket,
    revenue: Math.round(bucket.revenue),
  }));
};

export type TopProductStat = {
  productId: number;
  title: string;
  price: number;
  thumbnail?: string;
  sold: number;
};

/** Aggregates real cart line quantities per product, best sellers first. */
export const topProductsByQuantity = (
  orders: Order[],
  limit: number,
): TopProductStat[] => {
  const soldByProduct = new Map<number, TopProductStat>();

  for (const order of orders) {
    for (const item of order.items) {
      const current = soldByProduct.get(item.productId);
      if (current) {
        current.sold += item.quantity;
      } else {
        soldByProduct.set(item.productId, {
          productId: item.productId,
          title: item.title,
          price: item.price,
          thumbnail: item.thumbnail,
          sold: item.quantity,
        });
      }
    }
  }

  return [...soldByProduct.values()]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
};

export type StatusSlice = {
  status: OrderStatus;
  count: number;
  percent: number;
};

const STATUS_ORDER: OrderStatus[] = [
  "Delivered",
  "Processing",
  "Pending",
  "Cancelled",
];

/** Real distribution of the derived order statuses, chart-ready. */
export const orderStatusDistribution = (orders: Order[]): StatusSlice[] => {
  const total = orders.length;
  if (total === 0) {
    return [];
  }

  const counts = new Map<OrderStatus, number>();
  for (const order of orders) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }

  return STATUS_ORDER.filter((status) => counts.has(status)).map((status) => {
    const count = counts.get(status) ?? 0;
    return {
      status,
      count,
      percent: Math.round((count / total) * 100),
    };
  });
};

/**
 * Week-over-week trend percent for orders/revenue. Returns null when there is
 * no previous-week baseline to compare against.
 */
export const formatTrendPercent = (
  current: number,
  previous: number,
): string | null => {
  if (previous <= 0) {
    return null;
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  return `${percent >= 0 ? "+" : "-"}${Math.abs(percent)}%`;
};
