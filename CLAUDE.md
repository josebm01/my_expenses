# Mis Gastos — app de finanzas personales

App web (PWA) para registrar ingresos y gastos, clasificarlos por categoría y ver resúmenes mensuales. Uso personal (un solo usuario), pensada mobile-first para iPhone.

## Stack
- Next.js (App Router) + TypeScript, en `src/`
- Tailwind CSS v4 (tokens en `src/app/globals.css` con `@theme`)
- PostgreSQL + Prisma (`prisma/schema.prisma`)
- shadcn/ui para componentes base, `lucide-react` para íconos, Recharts para gráficas
- Backend con Server Actions / Route Handlers de Next.js. No usar NestJS.

## Comandos
- `npm run db:up` / `npm run db:down` — levantar / detener Postgres en Docker (`docker-compose.yml`, puerto 5433 del host). Copiar `.env.example` a `.env` la primera vez.
- `npm run dev` — servidor local
- `npx prisma migrate dev` — aplicar cambios al schema; luego `npx prisma generate` (Prisma 7 no lo hace solo). El cliente se genera en `src/generated/prisma` (ignorado en git).
- `.env` apunta a Neon (producción); `.env.development.local` al Docker y gana en dev (app, Prisma CLI y seed cargan los .env con `@next/env`). Fuera de `NODE_ENV=production` hay un guard que rechaza bases no locales (`ALLOW_REMOTE_DB=true` lo salta). Producción se migra sola en cada deploy de producción de Vercel (el script `build` corre `prisma migrate deploy` antes de `next build` solo si `VERCEL_ENV=production`; previews y local no migran), así que toda migración debe ser compatible con el código que sigue en producción. A mano solo con `npm run db:migrate:prod`, y solo cuando el usuario lo pida.
- `npm run db:seed` — carga los datos de ejemplo de `prisma/seed.ts` solo si la tabla está vacía
- `npx prisma studio` — ver datos
- `npm run lint` — correr antes de dar algo por terminado

## Diseño (fuente de verdad visual)
Los diseños están en `design/*.dc.html` (HTML con estilos inline y datos de ejemplo en el `<script>`).
Al implementar una pantalla, ábrela y replica layout, espaciados, tamaños y colores con Tailwind.
- `design/Main.dc.html` → `src/app/page.tsx` (Inicio)
- `design/Agregar.dc.html` → `src/app/new/page.tsx` (Nuevo movimiento)
- `design/Movimientos.dc.html` → `src/app/transactions/page.tsx`
- `design/Categorias.dc.html` → `src/app/summary/page.tsx`
- `design/Escritorio.dc.html` → referencia para breakpoints `md:`/`lg:` de las mismas rutas (no son páginas aparte)

### Tokens
- Fondo `#F3F4F1`, texto `#15171C`, secundario `#5B616E`, bordes `#E4E6E1`, tarjetas blancas
- Ingresos `#0B6A86` (azul), gastos `#B93D0B` (naranja). No usar verde/rojo; única excepción: el balance negativo va en rojo (`text-negative-on-dark`).
- Fuente Manrope vía `next/font/google`; números con `tabular-nums`
- Radios: tarjetas 20–22px, botones/inputs 14px, chips redondos completos
- Touch targets mínimo 44px

### Categorías
Son editables por el usuario (tabla `categories`, pantalla `/categories`). La BD guarda solo claves de ícono y paleta; los valores viven en `src/lib/category-styles.ts` (importable desde Client Components). Las de por defecto las inserta la migración `custom_categories`:
Hogar `#5B6472` Home · Alimentos `#C25E14` ShoppingCart · Transporte `#9A7410` Car · Servicios `#B03A6E` Zap · Entretenimiento `#7444C0` Ticket · Compras `#2F5FC4` ShoppingBag · Salud `#1E7F73` Heart.
Ingresos: Sueldo, Freelance, Ventas, Reembolso (color `#0B6A86`).
Eliminar una categoría con movimientos la archiva (`archivedAt`): deja de ofrecerse, pero el historial la conserva.

### Préstamos (`/loans`)
Dinero que el usuario presta a una persona (`loans`) en uno o varios montos con concepto (`loan_items`: "Moto", "Préstamo de dinero") y que le van abonando al total (`loan_payments`); el total y el saldo pendiente se calculan, no se guardan.
Con `countInTotals`, cada monto genera un gasto y cada abono un ingreso en las categorías de sistema `loans` / `loan-repayments` ("Préstamos"), que no se ofrecen en "Nuevo movimiento" ni en `/categories`.
Esos movimientos (con `loanItemId` / `loanPaymentId`) solo se cambian desde `src/lib/loans.ts`; la edición de movimientos redirige al préstamo.

## Reglas de datos
- Montos siempre `Decimal` (Prisma `@db.Decimal(12, 2)`), nunca `Float`.
- Guardar cada movimiento con fecha; los totales mensuales y por categoría se calculan con queries (`groupBy`), no se almacenan.
- Moneda MXN, formato con `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })`.
- Fechas en zona `America/Mexico_City`.

## Convenciones
- UI y textos en español; código (variables, funciones, archivos) en inglés.
- Componentes en `src/components/<dominio>/`, uno por archivo, PascalCase. Carpetas: `ui/` (shadcn), `layout/` (navegación y contenedores de página), `shared/` (genéricos usados en varias pantallas), `auth/`, `dashboard/` (tarjetas y gráficas de Inicio/Resumen), `transactions/`, `categories/`, `loans/`. Un componente nuevo va en la carpeta de su dominio; si lo usan varios dominios, en `shared/`.
- Importar cada componente por su ruta (`@/components/loans/LoanForm`); sin archivos `index.ts` de reexportación.
- Lógica de datos en `src/lib/` (p. ej. `src/lib/transactions.ts`); las páginas no llaman a Prisma directamente.
- Los módulos de `src/lib/` que usan Prisma o la sesión empiezan con `import "server-only"` (hoy: `prisma`, `transactions`, `loans`, `categories`, `auth`). Desde Client Components solo se importan sus tipos (`import type`); lo compartido con el cliente va en módulos sin Prisma (`format`, `dates`, `category-styles`, `loan-constants`…). Excepción: `database-guard.ts` no lo lleva porque también lo usan `prisma.config.ts` y `prisma/seed.ts`, que corren fuera de Next.
- Server Components por defecto; `"use client"` solo cuando haga falta estado o eventos.

## Autenticación
- Login con Google vía Better Auth sin base de datos (`src/lib/auth.ts`); solo entra `ALLOWED_EMAIL`.
- `src/proxy.ts` redirige a `/login` sin sesión, pero no basta: toda Server Action o Route Handler nuevo debe empezar con `await requireUser()`.
