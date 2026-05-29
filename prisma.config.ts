import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL bypasses PgBouncer, which is required for Prisma migrations on Supabase.
    // Falls back to DATABASE_URL if DIRECT_URL is not set (e.g. during local dev without pooling).
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
