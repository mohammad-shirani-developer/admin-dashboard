import "dotenv/config";
import { defineConfig } from "@prisma/config";

/**
 * Prisma 7 configuration: the CLI (migrate / studio / seed) no longer reads
 * DATABASE_URL from the schema file — it lives here, loaded from .env.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
