import { loadEnvConfig } from "@next/env";
import { defineConfig, env } from "prisma/config";
import { assertSafeDatabaseUrl } from "./src/lib/database-guard";

// Mismos archivos .env y misma prioridad que Next: sin NODE_ENV=production gana .env.development.local
// (Postgres de Docker). Para migrar producción: `npm run db:migrate:prod`.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", { info: () => {}, error: console.error });
assertSafeDatabaseUrl(process.env.DATABASE_URL_UNPOOLED, "DATABASE_URL_UNPOOLED");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // La CLI (migrate, studio) usa la conexión directa; la app usa DATABASE_URL (pooler) en src/lib/prisma.ts
  datasource: {
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
