# E-Commerce Engine

A headless, multi-store e-commerce engine. The engine owns **data, business logic and commerce operations** and exposes them through a REST API. Completely independent storefronts (Angular, React, Vue, ...) can be built on top of the same engine without touching core commerce logic.

```
                    E-COMMERCE ENGINE
                           |
              +------------+------------+
              |                         |
              v                         v
          Admin Panel              Storefronts (any framework)
```

## Repository layout

```
apps/
  api/      NestJS REST API (JWT auth, MongoDB, Swagger)
  admin/    Angular standalone admin panel (Tailwind, dark-first UI)
libs/
  types/    Shared TypeScript domain types (@ecom/types)
```

The structure is designed so a separate `apps/storefront` (or an external repo) can be added later and consume the exact same API.

## Tech stack

- **Backend:** NestJS, TypeScript, MongoDB + Mongoose, JWT, class-validator, Swagger
- **Frontend:** Angular (standalone components), TypeScript, Tailwind CSS
- **Monorepo:** npm workspaces

## Prerequisites

- Node >= 20
- MongoDB >= 6 running locally (or set `MONGODB_URI`)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start MongoDB (if not already running)
mongod --dbpath ~/data/db

# 4. Seed the database (creates admin user, demo store, catalog, customers, orders)
npm run seed

# 5. Start the API (http://localhost:3000/api, Swagger at /api/docs)
npm run start:api:dev

# 6. Start the admin panel (http://localhost:4200)
npm run start:admin
```

### Default admin login

- Email: `admin@ecommerce.engine`
- Password: `Admin123!`

(configurable via `SEED_ADMIN_*` env vars)

## API

- Base URL: `http://localhost:3000/api`
- Swagger docs: `http://localhost:3000/api/docs`
- Admin endpoints: `/api/admin/...`
- Storefront endpoints: `/api/storefront/...`

Both admin and storefront APIs use the same underlying commerce engine.

### Example

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@ecommerce.engine","password":"Admin123!"}'

# List products for a store
curl http://localhost:3000/api/admin/products?storeId=<STORE_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

## Multi-store

Every commerce entity is scoped to a `storeId`. Admin endpoints accept a `storeId` query param (or header `x-store-id`). The engine can run Store A and Store B with separate catalogs, orders and customers from a single deployment.

## Scripts

| Script | Description |
| --- | --- |
| `npm run start:api:dev` | Start NestJS API in watch mode |
| `npm run start:admin` | Start Angular admin dev server |
| `npm run seed` | Seed demo data into MongoDB |
| `npm run build:api` | Build the API |
| `npm run build:admin` | Build the admin panel |
| `npm run test:api` | Run backend unit tests |

## Architecture principles

- The backend never contains storefront-specific UI logic.
- Commerce data and business operations live in the engine.
- Storefronts own layout, design, UX, branding and visual presentation.
- Modular monolith: modules can be extracted into services later.
