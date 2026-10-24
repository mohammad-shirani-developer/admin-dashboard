import type {
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductCategory,
  ProductStatus,
  User,
} from "@/app/dashboard/types";

/**
 * Typed data layer for DummyJSON (https://dummyjson.com).
 *
 * Raw API payloads are mapped into the existing domain types via the exported
 * pure mappers (mapApiProduct, mapApiUser, mapApiCartToOrder, mapApiCustomer)
 * so pages never depend on the wire format. Orders are derived from carts:
 * real user names are joined by userId, dates are deterministic pseudo dates
 * derived from the cart id and the status is derived id-mod so every cart
 * maps to a stable Delivered/Processing/Pending/Cancelled value.
 *
 * NOTE: DummyJSON is a read-only API — create/update/delete operations are
 * applied to the React Query cache only.
 */

/* Server-side override for E2E failure simulations (e.g. pointing the API at
   a dead host). Never inlined into client bundles: read only at request time. */
const DUMMYJSON_BASE_URL =
  process.env.DUMMYJSON_BASE_URL ?? "https://dummyjson.com";

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/* Hardened request pipeline: every call gets a hard timeout and up to three
   attempts with a small backoff. Only transient failures (network errors and
   5xx responses) are retried — 4xx answers fail fast because retrying them
   cannot succeed. */
const REQUEST_TIMEOUT_MS = 10_000;
const RETRY_DELAYS_MS = [500, 1_000] as const;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const isTransientError = (error: unknown): boolean =>
  !(error instanceof ApiError) ||
  error.status === undefined ||
  error.status >= 500;

async function requestOnce<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${DUMMYJSON_BASE_URL}${path}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new ApiError(
      `Network error while calling DummyJSON "${path}": ${
        cause instanceof Error ? cause.message : "unknown error"
      }`,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `DummyJSON request failed for "${path}" with status ${response.status}.`,
      response.status,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(`DummyJSON returned invalid JSON for "${path}".`);
  }
}

async function fetchFromDummyJson<T>(path: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS_MS[attempt - 1]);
    }

    try {
      return await requestOnce<T>(path);
    } catch (error) {
      lastError = error;

      if (!isTransientError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

/* ----------------------------- raw API shapes ---------------------------- */

export type ApiProduct = {
  id: number;
  title: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  thumbnail?: string;
};

export type ApiUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  image?: string;
};

export type ApiCartLine = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail?: string;
};

export type ApiCart = {
  id: number;
  userId: number;
  total: number;
  products: ApiCartLine[];
};

type ApiProductsResponse = { products: ApiProduct[] };
type ApiUsersResponse = { users: ApiUser[] };
type ApiCartsResponse = { carts: ApiCart[] };

/* ------------------------------ pure mappers ----------------------------- */

const CATEGORY_BY_SLUG: Record<string, ProductCategory> = {
  laptops: "Laptop",
  smartphones: "Phone",
  "mobile-accessories": "Headphones",
};

const ROLE_BY_API_ROLE: Record<string, User["role"]> = {
  admin: "Admin",
  moderator: "Manager",
  user: "User",
};

export const productStatusForStock = (stock: number): ProductStatus => {
  if (stock > 5) {
    return "In Stock";
  }
  if (stock > 0) {
    return "Low Stock";
  }
  return "Out of Stock";
};

export const mapApiProduct = (raw: ApiProduct): Product => ({
  id: raw.id,
  name: raw.title,
  price: raw.price,
  category: CATEGORY_BY_SLUG[raw.category] ?? "Laptop",
  stock: raw.stock,
  status: productStatusForStock(raw.stock),
  description: raw.description,
  thumbnail: raw.thumbnail,
});

export const mapApiUser = (raw: ApiUser): User => ({
  id: raw.id,
  name: `${raw.firstName} ${raw.lastName}`.trim(),
  email: raw.email,
  role: ROLE_BY_API_ROLE[raw.role ?? "user"] ?? "User",
  status: raw.id % 4 === 0 ? "Inactive" : "Active",
  image: raw.image,
});

/**
 * Deterministic pseudo date derived from the order id: `id % 30` days back
 * from today, so every order always maps to the same date for a given day.
 */
export const deriveOrderDate = (id: number, now: Date = new Date()): string => {
  const date = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  date.setUTCDate(date.getUTCDate() - (id % 30));
  return date.toISOString().slice(0, 10);
};

/**
 * Deterministic status derived from the order id (weighted id-mod so most
 * orders map to Delivered, matching a realistic store distribution).
 */
export const deriveOrderStatus = (id: number): OrderStatus => {
  const bucket = id % 10;
  if (bucket < 6) {
    return "Delivered";
  }
  if (bucket < 8) {
    return "Processing";
  }
  if (bucket === 8) {
    return "Pending";
  }
  return "Cancelled";
};

export const mapApiCartToOrder = (
  raw: ApiCart,
  users: ApiUser[] = [],
): Order => {
  const user = users.find((candidate) => candidate.id === raw.userId);
  const customer = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : `User #${raw.userId}`;

  const items: OrderItem[] = raw.products.map((line) => ({
    productId: line.id,
    title: line.title,
    price: line.price,
    quantity: line.quantity,
    thumbnail: line.thumbnail,
  }));

  const [firstLine, ...restLines] = raw.products;
  const product = firstLine
    ? restLines.length > 0
      ? `${firstLine.title} +${restLines.length} more`
      : firstLine.title
    : "Unknown product";

  return {
    id: raw.id,
    customer,
    product,
    amount: raw.total,
    date: deriveOrderDate(raw.id),
    status: deriveOrderStatus(raw.id),
    items,
  };
};

export type CustomerSalesStats = { count: number; totalSpent: number };

export const mapApiCustomer = (
  raw: ApiUser,
  salesByUserId: Record<number, CustomerSalesStats> = {},
): Customer => {
  const stats = salesByUserId[raw.id] ?? { count: 0, totalSpent: 0 };

  return {
    id: raw.id,
    name: `${raw.firstName} ${raw.lastName}`.trim(),
    email: raw.email,
    orders: stats.count,
    totalSpent: stats.totalSpent,
    status: raw.id % 4 === 0 ? "Inactive" : "Active",
    image: raw.image,
  };
};

/* -------------------------------- fetchers ------------------------------- */

const PRODUCT_CATEGORY_SLUGS = [
  "laptops",
  "smartphones",
  "mobile-accessories",
] as const;

export const fetchProducts = async (): Promise<Product[]> => {
  const responses = await Promise.all(
    PRODUCT_CATEGORY_SLUGS.map((slug) =>
      fetchFromDummyJson<ApiProductsResponse>(
        `/products/category/${slug}?limit=0`,
      ),
    ),
  );

  return responses
    .flatMap((response) => response.products)
    .map(mapApiProduct)
    .sort((a, b) => a.id - b.id);
};

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetchFromDummyJson<ApiUsersResponse>("/users?limit=0");
  return response.users.map(mapApiUser);
};

export const fetchOrders = async (): Promise<Order[]> => {
  const [cartsResponse, usersResponse] = await Promise.all([
    fetchFromDummyJson<ApiCartsResponse>("/carts?limit=0"),
    fetchFromDummyJson<ApiUsersResponse>("/users?limit=0"),
  ]);

  return cartsResponse.carts
    .map((cart) => mapApiCartToOrder(cart, usersResponse.users))
    .sort((a, b) => b.id - a.id);
};

/** Customers are the second page of users (skip=20) joined with real carts. */
export const fetchCustomers = async (): Promise<Customer[]> => {
  const [usersResponse, cartsResponse] = await Promise.all([
    fetchFromDummyJson<ApiUsersResponse>("/users?limit=0&skip=20"),
    fetchFromDummyJson<ApiCartsResponse>("/carts?limit=0"),
  ]);

  const salesByUserId: Record<number, CustomerSalesStats> = {};
  for (const cart of cartsResponse.carts) {
    const current = salesByUserId[cart.userId] ?? { count: 0, totalSpent: 0 };
    current.count += 1;
    current.totalSpent += cart.total;
    salesByUserId[cart.userId] = current;
  }

  return usersResponse.users.map((raw) => mapApiCustomer(raw, salesByUserId));
};
