# Mis Gastos

App web (PWA) de finanzas personales para registrar ingresos y gastos, clasificarlos por categoría y ver resúmenes mensuales. Uso personal, mobile-first para iPhone.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Recharts · PostgreSQL 17 + Prisma 7

## Requisitos

- Node.js 20 o superior
- Docker (para la base de datos local)

## Primeros pasos

```bash
npm install                # también genera el cliente de Prisma
cp .env.example .env
npm run db:up              # levanta Postgres en Docker y espera a que esté listo
npx prisma migrate dev     # crea las tablas
npm run db:seed            # opcional: carga movimientos de ejemplo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción. En los deploys de producción de Vercel (`VERCEL_ENV=production`), `build` primero aplica las migraciones pendientes; en previews y en local solo hace el build |
| `npm run lint` | ESLint (correr antes de dar algo por terminado) |
| `npm run db:up` / `npm run db:down` | Levanta / detiene Postgres en Docker. Los datos persisten en el volumen `db-data` |
| `npm run db:seed` | Carga los datos de ejemplo de `prisma/seed.ts`, solo si la tabla está vacía |
| `npx prisma migrate dev` | Aplica cambios del schema (en la BD de desarrollo). En Prisma 7 hay que correr después `npx prisma generate` |
| `npm run db:migrate:prod` | Aplica a mano las migraciones pendientes en producción (Neon), con `NODE_ENV=production`. Normalmente no hace falta: el deploy lo hace solo |
| `npx prisma studio` | Explorar los datos en el navegador |

## Base de datos

Postgres corre en Docker ([docker-compose.yml](docker-compose.yml)) en el **puerto 5433** del host, para no chocar con otros Postgres locales en el 5432.

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Puerto | `5433` |
| Base de datos | `my_expenses` |
| Usuario | `my_expenses` |
| Contraseña | `my_expenses` |

Estas credenciales son solo para desarrollo local. La app las toma de `DATABASE_URL` en `.env`.

### Desarrollo vs producción

Si tu `.env` apunta a Neon (producción), pon las URLs del Docker en `.env.development.local` (ignorado en git):
`npm run dev`, la CLI de Prisma y el seed lo cargan con prioridad sobre `.env`, igual que Next. Solo
`NODE_ENV=production` (`npm run build`, `npm start`, `npm run db:migrate:prod`) usa las URLs de `.env`.

Además, fuera de producción la app, Prisma y el seed se niegan a conectarse a una base que no sea `localhost`
([src/lib/database-guard.ts](src/lib/database-guard.ts)). Para hacerlo a propósito: `ALLOW_REMOTE_DB=true`.

- El schema está en [prisma/schema.prisma](prisma/schema.prisma); hay una sola tabla, `transactions`.
- Los montos se guardan como `Decimal(12, 2)`. Los totales mensuales y por categoría se calculan con queries (`groupBy`) y no se almacenan.
- Las categorías (nombre, color, ícono) viven en código, en [src/lib/categories.ts](src/lib/categories.ts). La tabla solo guarda su id en `category_id`.
- El cliente de Prisma se genera en `src/generated/prisma` (ignorado en git).

Para borrar todos los datos y empezar de cero: `docker compose down -v`, y luego repetir `db:up`, `migrate dev` y `db:seed`.

## Inicio de sesión

La app pide entrar con Google ([Better Auth](https://better-auth.com), sin tablas: la sesión es una cookie cifrada que dura 90 días). Solo entra el correo de `ALLOWED_EMAIL`; si está vacío, no entra nadie.

1. En [Google Cloud Console](https://console.cloud.google.com/apis/credentials) crea un **ID de cliente de OAuth** de tipo *Aplicación web*.
2. En **URIs de redireccionamiento autorizados** agrega `http://localhost:3000/api/auth/callback/google` (y la de producción, p. ej. `https://tu-dominio/api/auth/callback/google`).
3. Copia el ID y el secreto a `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env`, pon tu correo en `ALLOWED_EMAIL` y genera `BETTER_AUTH_SECRET` con `openssl rand -base64 32`.
4. En producción, `BETTER_AUTH_URL` debe ser la URL pública de la app.

## Estructura

```
design/            Diseños de referencia (*.dc.html), fuente de verdad visual
prisma/            Schema, migraciones y seed
src/app/           Rutas: / (Inicio), /new, /transactions, /summary, /categories, /loans, /login
src/components/    Componentes de UI, uno por archivo, agrupados por dominio:
  ui/              Base de shadcn/ui
  layout/          Navegación y contenedores de página (BottomNav, Sidebar, PageContainer…)
  shared/          Piezas genéricas reutilizables (Card, FilterChips, MonthSelect…)
  auth/            Inicio/cierre de sesión y avatar
  dashboard/       Tarjetas y gráficas de Inicio y Resumen
  transactions/    Formulario, filas y filtros de movimientos
  categories/      Formulario e ícono de categorías
  loans/           Préstamos, montos y abonos
src/lib/           Lógica de datos y utilidades (las páginas no llaman a Prisma directamente)
```

Las convenciones del proyecto (tokens de diseño, categorías, reglas de datos) están en [CLAUDE.md](CLAUDE.md).
