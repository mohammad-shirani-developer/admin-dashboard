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
  name: `${raw.firstName.trim()} ${raw.lastName.trim()}`.trim(),
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
    ? `${user.firstName.trim()} ${user.lastName.trim()}`.trim()
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
    name: `${raw.firstName.trim()} ${raw.lastName.trim()}`.trim(),
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

/* ------------------------------- mutations ------------------------------- */

const CATEGORY_SLUG_BY_DOMAIN: Record<ProductCategory, string> = {
  Laptop: "laptops",
  Phone: "smartphones",
  Headphones: "mobile-accessories",
};

const API_ROLE_BY_DOMAIN: Record<User["role"], string> = {
  Admin: "admin",
  Manager: "moderator",
  User: "user",
};

/* Write pipeline: exactly ONE attempt. Unlike reads, a write must never be
   retried automatically — a retried POST could create duplicate entities.
   Any failure surfaces to the mutation, which rolls the optimistic cache
   update back so the UI never lies about what the server accepted. */
async function writeToDummyJson<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${DUMMYJSON_BASE_URL}${path}`, {
      method,
      headers:
        body === undefined
          ? undefined
          : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new ApiError(
      `Network error while calling DummyJSON "${method} ${path}": ${
        cause instanceof Error ? cause.message : "unknown error"
      }`,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `DummyJSON write failed for "${method} ${path}" with status ${response.status}.`,
      response.status,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(`DummyJSON returned invalid JSON for "${path}".`);
  }
}

/* DummyJSON's fake database never persists writes: an entity created this
   session gets a real server id, but a later PUT/DELETE for that id answers
   404. Those entities are registered here and their edits/deletes stay
   cache-only, while every original DummyJSON entity goes through a real
   request. */
const locallyCreatedUserIds = new Set<number>();
const locallyCreatedProductIds = new Set<number>();

/* Worse: the fake DB hands out the SAME id for every create (curl-verified:
   209 for users, 195 for products), so a second create in one session would
   collide with the first — duplicate React keys, and an edit or delete of
   one row silently hitting both. Created entities therefore get a unique
   negative client id; the server's echoed id is never used as identity. */
let localEntityIdCounter = 0;

const nextLocalEntityId = (): number => {
  localEntityIdCounter -= 1;

  return localEntityIdCounter;
};

/** Clears both session-created registries. Called on sign-out together
 *  with queryClient.clear() so optimistic rows can never leak into the
 *  next sign-in as phantom entities. */
export const resetSessionRegistry = () => {
  locallyCreatedUserIds.clear();
  locallyCreatedProductIds.clear();
};

const splitDisplayName = (name: string) => {
  const [firstName, ...rest] = name.trim().split(/\s+/);

  return { firstName: firstName || "Unknown", lastName: rest.join(" ") || "-" };
};

export type UserWriteInput = Pick<User, "name" | "email" | "role" | "status">;

/** POST /users/add — DummyJSON returns the created user with a server id. */
export const createUser = async (
  input: UserWriteInput,
): Promise<User> => {
  const { firstName, lastName } = splitDisplayName(input.name);

  await writeToDummyJson<ApiUser>("/users/add", "POST", {
    firstName,
    lastName,
    email: input.email,
  });

  const localId = nextLocalEntityId();

  locallyCreatedUserIds.add(localId);

  /* The fake endpoint echoes role "user" and has no status field — the
     values the admin picked in the form stay authoritative. */
  return {
    id: localId,
    name: input.name.trim(),
    email: input.email,
    role: input.role,
    status: input.status,
  };
};

/** PUT /users/:id — real request for original entities, cache-only for
 *  session-created ones (the fake DB would answer 404). */
export const updateUser = async (user: User): Promise<User> => {
  if (locallyCreatedUserIds.has(user.id)) {
    return user;
  }

  const { firstName, lastName } = splitDisplayName(user.name);

  const raw = await writeToDummyJson<ApiUser>(`/users/${user.id}`, "PUT", {
    firstName,
    lastName,
    email: user.email,
    role: API_ROLE_BY_DOMAIN[user.role],
  });

  return {
    ...mapApiUser(raw),
    name: user.name.trim(),
    email: user.email,
    role: user.role,
    status: user.status,
  };
};

/** DELETE /users/:id — same split as update. */
export const deleteUser = async (user: User): Promise<void> => {
  if (locallyCreatedUserIds.has(user.id)) {
    return;
  }

  await writeToDummyJson<ApiUser & { isDeleted?: boolean }>(
    `/users/${user.id}`,
    "DELETE",
  );
};

export type ProductWriteInput = Pick<
  Product,
  "name" | "price" | "category" | "stock" | "status"
> & {
  description?: string;
  imageUrl?: string;
};

/** POST /products/add — returns the created product with a server id. */
export const createProduct = async (
  input: ProductWriteInput,
): Promise<Product> => {
  await writeToDummyJson<ApiProduct>("/products/add", "POST", {
    title: input.name,
    description: input.description ?? "",
    price: input.price,
    stock: input.stock,
    category: CATEGORY_SLUG_BY_DOMAIN[input.category],
  });

  const localId = nextLocalEntityId();

  locallyCreatedProductIds.add(localId);

  return {
    id: localId,
    name: input.name,
    price: input.price,
    category: input.category,
    stock: input.stock,
    status: input.status,
    description: input.description || undefined,
    thumbnail: input.imageUrl || undefined,
  };
};

/** PUT /products/:id — real request for original entities, cache-only for
 *  session-created ones. Status is always re-derived from stock. */
export const updateProduct = async (product: Product): Promise<Product> => {
  if (locallyCreatedProductIds.has(product.id)) {
    return product;
  }

  const raw = await writeToDummyJson<ApiProduct>(
    `/products/${product.id}`,
    "PUT",
    {
      title: product.name,
      description: product.description ?? "",
      price: product.price,
      stock: product.stock,
      category: CATEGORY_SLUG_BY_DOMAIN[product.category],
    },
  );

  return {
    ...mapApiProduct(raw),
    name: product.name,
    description: product.description,
    thumbnail: product.thumbnail,
  };
};

/** DELETE /products/:id — same split as update. */
export const deleteProduct = async (product: Product): Promise<void> => {
  if (locallyCreatedProductIds.has(product.id)) {
    return;
  }

  await writeToDummyJson<ApiProduct & { isDeleted?: boolean }>(
    `/products/${product.id}`,
    "DELETE",
  );
};
