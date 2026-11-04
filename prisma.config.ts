import "dotenv/config";
import { defineConfig, env } from "prisma/config";

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
