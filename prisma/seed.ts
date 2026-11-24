import bcrypt from "bcryptjs";
import {
  PrismaPg,
} from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import type {
  CustomerStatus,
  OrderStatus,
  ProductCategory,
  UserStatus,
  UserRole,
} from "../app/generated/prisma/client";

/**
 * Deterministic seed: same PRNG seed -> the exact same database every time,
 * so screenshots, tests and Lighthouse runs stay comparable.
 *
 * Run with:  npm run db:seed   (or: npx prisma db seed)
 */

/* ------------------------- connection (standalone) ------------------------ */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set — copy .env.example to .env and fill it in.",
  );
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/* --------------------------- deterministic PRNG --------------------------- */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261124);
const randInt = (min: number, max: number): number =>
  Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(rand() * items.length)];

/** Skewed towards recent days: rand()^1.5 clusters near 0. */
const recentDayOffset = (maxDays: number): number =>
  Math.floor(maxDays * Math.pow(rand(), 1.5));

/* ------------------------------- fixtures -------------------------------- */

const DEMO_ADMIN = {
  name: "Admin Demo",
  email: "admin@demo.com",
  password: "Admin1234!",
} as const;

type PanelUserSeed = {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

const PANEL_USERS: PanelUserSeed[] = [
  { name: "Admin Demo", email: "admin@demo.com", role: "Admin", status: "Active" },
  { name: "Sara Klein", email: "sara.klein@demo.com", role: "Manager", status: "Active" },
  { name: "David Ruiz", email: "david.ruiz@demo.com", role: "Manager", status: "Active" },
  { name: "Emma Fischer", email: "emma.fischer@demo.com", role: "Admin", status: "Active" },
  { name: "Omar Haddad", email: "omar.haddad@demo.com", role: "User", status: "Active" },
  { name: "Lucy Chen", email: "lucy.chen@demo.com", role: "User", status: "Inactive" },
  { name: "Marco Bianchi", email: "marco.bianchi@demo.com", role: "User", status: "Active" },
  { name: "Nina Petrova", email: "nina.petrova@demo.com", role: "User", status: "Inactive" },
];

type ProductSeed = {
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
};

const PRODUCTS: ProductSeed[] = [
  // Laptops
  { name: "MacBook Air M3 13\"", category: "Laptop", price: 1099.0, stock: 24, description: "Ultra-thin laptop with the M3 chip, 13.6-inch Liquid Retina display." },
  { name: "MacBook Pro 14 M4", category: "Laptop", price: 1599.0, stock: 11, description: "Pro laptop with M4 chip, 14.2-inch Liquid Retina XDR display." },
  { name: "Dell XPS 13", category: "Laptop", price: 999.0, stock: 18, description: "Compact 13.4-inch InfinityEdge laptop with Intel Core Ultra." },
  { name: "Dell XPS 15", category: "Laptop", price: 1499.0, stock: 7, description: "15.6-inch OLED laptop for creators with dedicated graphics." },
  { name: "HP Spectre x360 14", category: "Laptop", price: 1249.0, stock: 9, description: "Convertible 2-in-1 with 2.8K OLED touchscreen." },
  { name: "Lenovo ThinkPad X1 Carbon", category: "Laptop", price: 1449.0, stock: 13, description: "Business ultrabook, 14-inch, carbon-fibre chassis." },
  { name: "Asus ZenBook 14 OLED", category: "Laptop", price: 899.0, stock: 22, description: "Lightweight laptop with 14-inch 3K OLED display." },
  { name: "Acer Swift Go 14", category: "Laptop", price: 749.0, stock: 0, description: "Budget-friendly thin-and-light with Ryzen 7." },
  // Phones
  { name: "iPhone 15 Pro 128GB", category: "Phone", price: 999.0, stock: 31, description: "Titanium flagship with A17 Pro chip and 48MP camera." },
  { name: "iPhone 14 128GB", category: "Phone", price: 699.0, stock: 26, description: "A15 Bionic, dual-camera system, Ceramic Shield." },
  { name: "Samsung Galaxy S24 256GB", category: "Phone", price: 859.0, stock: 19, description: "Galaxy AI features, 6.2-inch AMOLED, triple camera." },
  { name: "Samsung Galaxy A54 5G", category: "Phone", price: 349.0, stock: 42, description: "Mid-range 5G phone with Super AMOLED display." },
  { name: "Google Pixel 8 128GB", category: "Phone", price: 699.0, stock: 15, description: "Tensor G3 with best-in-class computational photography." },
  { name: "Google Pixel 8a", category: "Phone", price: 499.0, stock: 3, description: "Affordable Pixel with the same Tensor G3 chip." },
  { name: "Xiaomi 14 512GB", category: "Phone", price: 899.0, stock: 0, description: "Leica cameras, Snapdragon 8 Gen 3, compact body." },
  { name: "OnePlus 12 256GB", category: "Phone", price: 799.0, stock: 12, description: "Hasselblad camera, 100W fast charging, 120Hz AMOLED." },
  // Headphones
  { name: "AirPods Pro 2 (USB-C)", category: "Headphones", price: 249.0, stock: 55, description: "ANC earbuds with adaptive transparency and USB-C." },
  { name: "Sony WH-1000XM5", category: "Headphones", price: 399.0, stock: 28, description: "Industry-leading noise cancelling over-ear headphones." },
  { name: "Bose QuietComfort 45", category: "Headphones", price: 329.0, stock: 17, description: "Comfortable ANC headphones with 24h battery." },
  { name: "Sennheiser HD 660S2", category: "Headphones", price: 299.0, stock: 5, description: "Audiophile open-back headphones, 300-ohm driver." },
  { name: "JBL Tune 510BT", category: "Headphones", price: 49.99, stock: 80, description: "Wireless on-ear headphones with JBL Pure Bass." },
  { name: "Beats Studio Pro", category: "Headphones", price: 349.0, stock: 2, description: "ANC over-ear with spatial audio and USB-C audio." },
  { name: "Anker Soundcore Life Q30", category: "Headphones", price: 79.99, stock: 64, description: "Hybrid ANC budget headphones, 40h playtime." },
  { name: "Samsung Galaxy Buds2 Pro", category: "Headphones", price: 229.0, stock: 0, description: "Compact earbuds with 24-bit hi-fi audio." },
];

const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael",
  "Linda", "Daniel", "Elizabeth", "Matthew", "Susan", "Andrew", "Karen",
  "Thomas", "Nancy", "Christopher", "Betty", "Ryan", "Sandra", "Adam",
  "Alice", "Ethan", "Diana", "Noah", "Julia", "Liam", "Rose", "Hugo",
  "Clara", "Felix", "Mona", "Arthur", "Helen", "Oscar", "Leila", "Kian",
  "Tara", "Reza", "Parisa", "Amir", "Sana",
] as const;
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Wilson", "Anderson", "Taylor", "Thomas", "Moore", "Martin",
  "Jackson", "White", "Harris", "Clark", "Lewis", "Walker", "Hall",
  "Young", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson",
  "Carter", "Mitchell", "Turner", "Phillips", "Campbell", "Parker",
  "Evans", "Edwards", "Collins", "Stewart", "Morris", "Rahimi", "Ahmadi",
] as const;

/** Same weighted distribution the old deriveOrderStatus produced. */
function weightedOrderStatus(): OrderStatus {
  const bucket = randInt(1, 10);
  if (bucket <= 6) {
    return "Delivered";
  }
  if (bucket <= 8) {
    return "Processing";
  }
  if (bucket === 9) {
    return "Pending";
  }
  return "Cancelled";
}

/** Every 4th record inactive — mirrors the old mapApiUser behaviour. */
const statusForId = (id: number): CustomerStatus =>
  id % 4 === 0 ? "Inactive" : "Active";

/* ------------------------------ seed itself ------------------------------- */

const ORDER_COUNT = 150;
const CUSTOMER_COUNT = 42;
const ORDER_MAX_AGE_DAYS = 180;

async function main(): Promise<void> {
  console.log("Seeding admin-dashboard database…");

  // Idempotent: wipe children first so re-seeding never conflicts.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // ---- panel users (the demo admin gets a real bcrypt hash for Phase 2)
  const passwordHash = await bcrypt.hash(DEMO_ADMIN.password, 10);
  await prisma.user.createMany({
    data: PANEL_USERS.map((user) => ({
      ...user,
      // Only the demo admin account can sign in for now; the rest are
      // plain panel records until Phase 2 wires up Auth.js.
      passwordHash: user.email === DEMO_ADMIN.email ? passwordHash : null,
      image: null,
    })),
  });

  // ---- products
  await prisma.product.createMany({
    data: PRODUCTS.map((product) => ({
      name: product.name,
      category: product.category,
      price: product.price.toFixed(2),
      stock: product.stock,
      description: product.description,
      // thumbnails intentionally left null — the UI falls back gracefully
      thumbnail: null,
    })),
  });
  const products = await prisma.product.findMany({
    select: { id: true, name: true, price: true },
    orderBy: { id: "asc" },
  });

  // ---- customers
  const customerEmails = new Set<string>();
  const customerSeeds = Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const emailSlug = name.toLowerCase().replace(/\s+/g, ".");
    let email = `${emailSlug}@example.com`;
    let suffix = 2;
    while (customerEmails.has(email)) {
      email = `${emailSlug}${suffix}@example.com`;
      suffix += 1;
    }
    customerEmails.add(email);
    return {
      name,
      email,
      status: statusForId(index + 1),
      image: `https://i.pravatar.cc/150?img=${randInt(1, 70)}`,
    };
  });
  await prisma.customer.createMany({ data: customerSeeds });
  const customerIds = (
    await prisma.customer.findMany({ select: { id: true }, orderBy: { id: "asc" } })
  ).map((row) => row.id);

  // ---- orders over the last ORDER_MAX_AGE_DAYS days (skewed to recent)
  // Bulk writes instead of one round trip per order: the whole order set
  // goes through ~2 network round trips (createManyAndReturn + createMany)
  // instead of ~150, so the seed survives flaky connections to hosted
  // Postgres (Neon / Supabase) where long-lived sessions tend to drop.
  const now = new Date();
  const orderSeeds = Array.from({ length: ORDER_COUNT }, () => {
    const dayOffset = recentDayOffset(ORDER_MAX_AGE_DAYS);
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - dayOffset);

    const lineCount = randInt(1, 3);
    const chosen = new Set<number>();
    while (chosen.size < lineCount) {
      chosen.add(pick(products).id);
    }
    const lines = [...chosen].map((productId) => {
      const product = products.find((candidate) => candidate.id === productId)!;
      return {
        productId,
        title: product.name,
        price: Number(product.price),
        quantity: randInt(1, 3),
      };
    });
    const total = lines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0,
    );
    return {
      customerId: pick(customerIds),
      total: total.toFixed(2),
      status: weightedOrderStatus(),
      createdAt,
      lines,
    };
  });
  const totalRevenue = orderSeeds.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );

  // Postgres INSERT ... RETURNING preserves VALUES order, so createdOrders
  // lines up with orderSeeds by index. Fields are picked explicitly instead
  // of the ({ lines, ...rest }) omit idiom so ESLint's no-unused-vars stays
  // quiet.
  const createdOrders = await prisma.order.createManyAndReturn({
    data: orderSeeds.map((seed) => ({
      customerId: seed.customerId,
      total: seed.total,
      status: seed.status,
      createdAt: seed.createdAt,
    })),
  });

  const itemRows = createdOrders.flatMap((order, index) =>
    orderSeeds[index].lines.map((line) => ({ ...line, orderId: order.id })),
  );
  await prisma.orderItem.createMany({ data: itemRows });

  const [userCount, productCount, customerCount, orderCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.customer.count(),
      prisma.order.count(),
    ]);

  console.log(`  users      : ${userCount}`);
  console.log(`  products   : ${productCount}`);
  console.log(`  customers  : ${customerCount}`);
  console.log(`  orders     : ${orderCount} across the last ${ORDER_MAX_AGE_DAYS} days`);
  console.log(`  revenue    : $${totalRevenue.toFixed(2)} total`);
  console.log(`  demo login : ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`);
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
