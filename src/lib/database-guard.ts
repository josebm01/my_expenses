// Protege producción: fuera de NODE_ENV=production solo se permite el Postgres local de docker-compose.yml.
// Lo usan la app (src/lib/prisma.ts), la CLI de Prisma (prisma.config.ts) y el seed.

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/** Lanza si `url` apunta a una base remota en desarrollo, salvo que se pida explícitamente con `ALLOW_REMOTE_DB=true`. */
export function assertSafeDatabaseUrl(url: string | undefined, name: string): void {
  if (!url || process.env.NODE_ENV === "production" || process.env.ALLOW_REMOTE_DB === "true") return;

  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return; // Una URL inválida la reporta el propio driver.
  }
  if (LOCAL_HOSTS.has(host)) return;

  throw new Error(
    `${name} apunta a "${host}" y no estás en producción. En desarrollo solo se usa el Postgres local ` +
      `(.env.development.local) para no tocar los datos reales. Si de verdad quieres conectarte a esa base, ` +
      `corre el comando con ALLOW_REMOTE_DB=true.`,
  );
}
