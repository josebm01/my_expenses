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
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run lint` | ESLint (correr antes de dar algo por terminado) |
| `npm run db:up` / `npm run db:down` | Levanta / detiene Postgres en Docker. Los datos persisten en el volumen `db-data` |
| `npm run db:seed` | Carga los datos de ejemplo de `prisma/seed.ts`, solo si la tabla está vacía |
| `npx prisma migrate dev` | Aplica cambios del schema. En Prisma 7 hay que correr después `npx prisma generate` |
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

- El schema está en [prisma/schema.prisma](prisma/schema.prisma); hay una sola tabla, `transactions`.
- Los montos se guardan como `Decimal(12, 2)`. Los totales mensuales y por categoría se calculan con queries (`groupBy`) y no se almacenan.
- Las categorías (nombre, color, ícono) viven en código, en [src/lib/categories.ts](src/lib/categories.ts). La tabla solo guarda su id en `category_id`.
- El cliente de Prisma se genera en `src/generated/prisma` (ignorado en git).

Para borrar todos los datos y empezar de cero: `docker compose down -v`, y luego repetir `db:up`, `migrate dev` y `db:seed`.

## Estructura

```
design/            Diseños de referencia (*.dc.html), fuente de verdad visual
prisma/            Schema, migraciones y seed
src/app/           Rutas: / (Inicio), /new, /transactions, /summary
src/components/    Componentes de UI, uno por archivo
src/lib/           Lógica de datos y utilidades (las páginas no llaman a Prisma directamente)
```

Las convenciones del proyecto (tokens de diseño, categorías, reglas de datos) están en [CLAUDE.md](CLAUDE.md).
