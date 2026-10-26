import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ApiCart, ApiUser } from "../api";
import {
  ApiError,
  createUser,
  deriveOrderDate,
  deriveOrderStatus,
  fetchUsers,
  mapApiCartToOrder,
  mapApiCustomer,
  mapApiProduct,
  mapApiUser,
  productStatusForStock,
  updateUser,
} from "../api";

/* Small factories so every test starts from a complete, valid entity and
   only overrides the fields it actually cares about. */
const apiUser = (overrides: Partial<ApiUser> = {}): ApiUser => ({
  id: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@lovelace.dev",
  ...overrides,
});

const apiCart = (overrides: Partial<ApiCart> = {}): ApiCart => ({
  id: 1,
  userId: 7,
  total: 1998,
  products: [{ id: 11, title: "Phone X", price: 999, quantity: 1 }],
  ...overrides,
});

const okResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 });

const errorResponse = (status: number) =>
  new Response("nope", { status });

describe("pure mappers", () => {
  it("maps stock levels to the right status at the boundaries", () => {
    expect(productStatusForStock(6)).toBe("In Stock");
    expect(productStatusForStock(5)).toBe("Low Stock");
    expect(productStatusForStock(1)).toBe("Low Stock");
    expect(productStatusForStock(0)).toBe("Out of Stock");
  });

  it("maps known categories and falls back to Laptop for unknown ones", () => {
    const phone = mapApiProduct({
      id: 1,
      title: "iPhone 15",
      price: 999,
      stock: 10,
      category: "smartphones",
    });
    expect(phone.category).toBe("Phone");
    expect(phone.status).toBe("In Stock");

    const mystery = mapApiProduct({
      id: 2,
      title: "Smart Toaster",
      price: 49,
      stock: 1,
      category: "smart-home",
    });
    expect(mystery.category).toBe("Laptop");
  });

  it("falls back to a safe role and marks every 4th user inactive", () => {
    expect(mapApiUser(apiUser({ role: "moderator" })).role).toBe("Manager");
    expect(mapApiUser(apiUser()).role).toBe("User");
    expect(mapApiUser(apiUser({ role: "wizard" })).role).toBe("User");

    expect(mapApiUser(apiUser({ id: 8 })).status).toBe("Inactive");
    expect(mapApiUser(apiUser({ id: 7 })).status).toBe("Active");
  });

  it("trims the joined name so API whitespace never survives", () => {
    const user = mapApiUser(
      apiUser({ id: 3, firstName: "  Ada ", lastName: "  Lovelace " }),
    );
    expect(user.name).toBe("Ada Lovelace");
  });

  it("derives a deterministic order date from the id", () => {
    const now = new Date("2026-10-26T12:00:00Z");

    expect(deriveOrderDate(0, now)).toBe("2026-10-26");
    expect(deriveOrderDate(45, now)).toBe("2026-10-11");
  });

  it("buckets order ids into the four statuses", () => {
    expect(deriveOrderStatus(0)).toBe("Delivered");
    expect(deriveOrderStatus(6)).toBe("Processing");
    expect(deriveOrderStatus(8)).toBe("Pending");
    expect(deriveOrderStatus(9)).toBe("Cancelled");
  });

  it("joins the customer, summarizes product lines and falls back safely", () => {
    const users = [apiUser({ id: 7, firstName: "Grace", lastName: "Hopper" })];

    const order = mapApiCartToOrder(
      apiCart({
        products: [
          { id: 11, title: "Phone X", price: 999, quantity: 1 },
          { id: 12, title: "Case", price: 999, quantity: 1 },
        ],
      }),
      users,
    );
    expect(order.customer).toBe("Grace Hopper");
    expect(order.product).toBe("Phone X +1 more");
    expect(order.amount).toBe(1998);

    const stranger = mapApiCartToOrder(apiCart({ userId: 99 }), users);
    expect(stranger.customer).toBe("User #99");

    const empty = mapApiCartToOrder(apiCart({ products: [] }), users);
    expect(empty.product).toBe("Unknown product");
  });

  it("defaults customer stats to zero for users without sales", () => {
    const customer = mapApiCustomer(apiUser());

    expect(customer.orders).toBe(0);
    expect(customer.totalSpent).toBe(0);
    expect(customer.name).toBe("Ada Lovelace");
  });
});

describe("write pipeline", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("creates users with a unique negative id and keeps the form values", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(okResponse({ id: 209, role: "user" })),
    );

    const created = await createUser({
      name: "Ada Lovelace",
      email: "ada@lovelace.dev",
      role: "Admin",
      status: "Active",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(created.id).toBeLessThan(0);
    expect(created.id).not.toBe(209);
    expect(created.role).toBe("Admin");
    expect(created.status).toBe("Active");
  });

  it("splits the display name into firstName and lastName in the request body", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(okResponse({ id: 209 })),
    );

    await createUser({
      name: "Ada Lovelace",
      email: "ada@lovelace.dev",
      role: "User",
      status: "Active",
    });

    const [, firstInit] = fetchMock.mock.calls[0];
    expect(firstInit.method).toBe("POST");
    expect(JSON.parse(firstInit.body)).toMatchObject({
      firstName: "Ada",
      lastName: "Lovelace",
    });

    await createUser({
      name: "Cher",
      email: "cher@music.dev",
      role: "User",
      status: "Active",
    });

    const [, secondInit] = fetchMock.mock.calls[1];
    expect(JSON.parse(secondInit.body)).toMatchObject({
      firstName: "Cher",
      lastName: "-",
    });
  });

  it("keeps edits of session-created rows cache-only", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(okResponse({ id: 209 })),
    );

    const created = await createUser({
      name: "Ada Lovelace",
      email: "ada@lovelace.dev",
      role: "User",
      status: "Active",
    });

    fetchMock.mockClear();

    const updated = await updateUser({
      ...created,
      name: "Ada Hopper",
      role: "Manager",
      status: "Active",
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(updated.name).toBe("Ada Hopper");
    expect(updated.role).toBe("Manager");
  });

  it("sends a real PUT for original entities with the form values winning", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        okResponse({
          id: 10,
          firstName: "Echo",
          lastName: "Server",
          email: "echo@server.dev",
          role: "admin",
        }),
      ),
    );

    const updated = await updateUser({
      id: 10,
      name: "Grace Hopper",
      email: "grace@navy.mil",
      role: "Admin",
      status: "Active",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("https://dummyjson.com/users/10");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toMatchObject({
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@navy.mil",
      role: "admin",
    });

    expect(updated.name).toBe("Grace Hopper");
    expect(updated.email).toBe("grace@navy.mil");
    expect(updated.role).toBe("Admin");
  });

  it("fails fast: a failed write is never retried", async () => {
    fetchMock.mockRejectedValue(new TypeError("network down"));

    await expect(
      createUser({
        name: "Ada Lovelace",
        email: "ada@lovelace.dev",
        role: "User",
        status: "Active",
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("read pipeline", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("fails fast on 4xx without retrying", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(errorResponse(404)),
    );

    await expect(fetchUsers()).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries transient 5xx failures until they succeed", async () => {
    let calls = 0;

    fetchMock.mockImplementation(() => {
      calls += 1;

      if (calls < 3) {
        return Promise.resolve(errorResponse(503));
      }

      return Promise.resolve(
        okResponse({
          users: [apiUser({ id: 1 })],
        }),
      );
    });

    const pending = fetchUsers();

    await vi.advanceTimersByTimeAsync(500);
    await vi.advanceTimersByTimeAsync(1_000);

    const users = await pending;

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe("Ada Lovelace");
  });
});
