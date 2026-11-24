import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

/**
 * Prisma 7 needs a driver adapter instead of a bare connection string.
 * A single instance is reused across hot reloads (the classic Next.js
 * dev pattern) so you never exhaust Postgres connection slots.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
};

function createClient(): InstanceType<typeof PrismaClient> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set — copy .env.example to .env and fill it in.",
    );
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export const prisma: InstanceType<typeof PrismaClient> =
  globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
