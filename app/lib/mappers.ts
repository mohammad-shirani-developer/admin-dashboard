import {
  Prisma,
  type OrderStatus,
  type ProductCategory,
  type UserRole,
  type UserStatus,
  type CustomerStatus,
} from "@/app/generated/prisma/client";
import type {
  Customer,
  Order,
  OrderItem,
  Product,
  User,
  ProductStatus,
} from "@/app/dashboard/types";

/**
 * Bridge between database rows and the existing domain types.
 *
 * The Prisma enum values were deliberately chosen to match the domain
 * unions ("Admin", "Delivered", "Laptop", …) so those maps are identity
 * assignments. Everything else that differs (Decimal money, Date
 * timestamps, derived Product.status, computed Customer stats) is
 * normalized here — pages keep consuming the exact same shapes they
 * consumed from the DummyJSON layer.
 */

/* ------------------------------ row shapes ------------------------------- */

export type UserRow = Prisma.UserGetPayload<Record<never, never>>;
export type ProductRow = Prisma.ProductGetPayload<Record<never, never>>;
export type OrderRow = Prisma.OrderGetPayload<{
  include: { customer: true; items: { orderBy: { id: "asc" } } };
}>;
/** Customer joined with per-customer order stats (see groupCustomerStats). */
export type CustomerStats = {
  count: number;
  totalSpent: number;
};
export type CustomerRow = Prisma.CustomerGetPayload<Record<never, never>>;

/* --------------------------- normalizer helpers --------------------------- */

/** Decimal (or string/number) money -> JS number for the UI layer. */
export const toNumber = (value: unknown): number => Number(value);

/** Accepts Date or ISO string, returns the "YYYY-MM-DD" the UI expects. */
export const toIsoDate = (value: Date | string): string =>
  new Date(value).toISOString().slice(0, 10);

/* ------------------------------ product ---------------------------------- */

/** Single source of truth for the derived status (stock rules). */
export const productStatusForStock = (stock: number): ProductStatus => {
  if (stock > 5) {
    return "In Stock";
  }
  if (stock > 0) {
    return "Low Stock";
  }
  return "Out of Stock";
};

export const toDomainProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  price: toNumber(row.price),
  category: row.category satisfies ProductCategory,
  stock: row.stock,
  status: productStatusForStock(row.stock),
  description: row.description ?? undefined,
  thumbnail: row.thumbnail ?? undefined,
});

/* -------------------------------- user ----------------------------------- */

export const toDomainUser = (row: UserRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role satisfies UserRole,
  status: row.status satisfies UserStatus,
  image: row.image ?? undefined,
});

/* -------------------------------- order ---------------------------------- */

/** "Pixel 8" or "Pixel 8 +2 more" — same summary the old mapper built. */
export const orderSummaryFor = (items: OrderItem[]): string => {
  const [firstLine, ...restLines] = items;
  if (!firstLine) {
    return "Unknown product";
  }
  return restLines.length > 0
    ? `${firstLine.title} +${restLines.length} more`
    : firstLine.title;
};

export const toDomainOrderItems = (
  rows: OrderRow["items"],
): OrderItem[] =>
  rows.map((item) => ({
    productId: item.productId,
    title: item.title,
    price: toNumber(item.price),
    quantity: item.quantity,
    thumbnail: item.thumbnail ?? undefined,
  }));

export const toDomainOrder = (row: OrderRow): Order => {
  const items = toDomainOrderItems(row.items);
  return {
    id: row.id,
    customer: row.customer.name,
    product: orderSummaryFor(items),
    amount: toNumber(row.total),
    date: toIsoDate(row.createdAt),
    status: row.status satisfies OrderStatus,
    items,
  };
};

/* ------------------------------- customer -------------------------------- */

export const toDomainCustomer = (
  row: CustomerRow,
  stats: CustomerStats = { count: 0, totalSpent: 0 },
): Customer => ({
  id: row.id,
  name: row.name,
  email: row.email,
  orders: stats.count,
  totalSpent: stats.totalSpent,
  status: row.status satisfies CustomerStatus,
  image: row.image ?? undefined,
});

/**
 * Turns a groupBy result into the salesByCustomerId map the customer
 * mapper consumes — same shape the DummyJSON layer computed from carts.
 *
 * Usage (Phase 3):
 *   const stats = await prisma.order.groupBy({
 *     by: ["customerId"],
 *     _count: { _all: true },
 *     _sum: { total: true },
 *   });
 *   const salesByCustomerId = groupCustomerStats(stats);
 */
export type OrderGroupRow = {
  customerId: number;
  _count: { _all: number };
  _sum: { total: DecimalLike | null };
};
type DecimalLike = { toNumber: () => number } | number | string;

export const groupCustomerStats = (
  rows: OrderGroupRow[],
): Record<number, CustomerStats> => {
  const salesByCustomerId: Record<number, CustomerStats> = {};
  for (const row of rows) {
    salesByCustomerId[row.customerId] = {
      count: row._count._all,
      totalSpent: toNumber(row._sum.total ?? 0),
    };
  }
  return salesByCustomerId;
};
