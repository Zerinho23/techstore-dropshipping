# TechStore — Tienda Dropshipping Chile

Tienda de dropshipping de tecnología para el mercado chileno. Los clientes compran en el sitio y el dueño cumple los pedidos vía AliExpress. Precios en CLP, interfaz en español.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/tienda run dev` — run the frontend (port 22179)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Wouter + TanStack Query + Recharts + Framer Motion + shadcn/ui + Tailwind

## Where things live

- `lib/db/src/schema/` — DB schema (categories, products, cart_items, orders, order_items)
- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middleware/requireAdmin.ts` — Admin session auth middleware
- `artifacts/api-server/src/routes/auth.ts` — POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout
- `artifacts/tienda/src/` — React frontend
- `artifacts/tienda/src/pages/admin/` — Admin panel pages (Dashboard, Products, Orders, OrderDetail, Login)
- `artifacts/tienda/src/hooks/use-admin-auth.tsx` — AdminAuthProvider + useAdminAuth hook

## Architecture decisions

- Admin auth is session-based (express-session). Password stored in `ADMIN_PASSWORD` env var (defaults to `admin1234`).
- All admin API routes under `/api/dashboard/*` require `requireAdmin` middleware.
- Frontend admin routes are protected with `ProtectedAdminRoute` component in App.tsx.
- Cart sessions use a UUID stored in localStorage (`cartSessionId`).
- Prices are stored as integers (CLP, no decimals) in the DB.

## Product

- **Storefront**: Home con hero, categorías y productos destacados. Catálogo con filtros por categoría. Detalle de producto. Carrito y checkout. Página de confirmación de pedido.
- **Admin Panel**: Login con contraseña. Dashboard con métricas (ingresos, pedidos, stock), gráficos de barras y torta, tabla de pedidos recientes. Gestión de productos (CRUD completo). Gestión de pedidos con cambio de estado. Detalle de pedido.

## User preferences

- Prices always in CLP (Chilean Peso)
- All UI text in Spanish
- Dropshipping model: orders are fulfilled via AliExpress (aliexpressUrl field per product)

## Gotchas

- Kill ports before restarting: `fuser -k 8080/tcp 22179/tcp`
- Always run `pnpm run typecheck:libs` before `pnpm run typecheck` for leaf packages.
- Admin password defaults to `admin1234` if `ADMIN_PASSWORD` env var is not set.
- Change `ADMIN_PASSWORD` via Replit Secrets panel for production use.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
