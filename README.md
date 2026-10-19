# Crunch Box (CRUNCHIER) 🍔🍟

A modern full-stack food ordering and kitchen management ecosystem built with **TanStack Start**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**.

The project consists of two coordinated applications connected via shared configurations:
- **`CUSTOMER`**: Public-facing storefront web app (browse menu, combos, cart, checkout, order tracking).
- **`KITCHEN`**: Kitchen Display System (KDS) & Operations Portal (live order queue, status workflows, menu management, store operating hours, delivery fee controls).
- **`shared-settings.json`**: Real-time cross-app synchronization file for operational flags (accepting orders, store hours, delivery fee, timezone).

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Quick Start: Running the Project](#quick-start-running-the-project)
  - [1. Install Dependencies](#1-install-dependencies)
  - [2. Environment Variables](#2-environment-variables)
  - [3. Start the Development Servers](#3-start-the-development-servers)
- [Available Commands Reference](#available-commands-reference)
  - [Customer App (`CUSTOMER`)](#customer-app-customer)
  - [Kitchen Portal (`KITCHEN`)](#kitchen-portal-kitchen)
- [Port Allocations](#port-allocations)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Shared Settings & Database](#shared-settings--database)

---

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: Version `20.x` or higher (tested on Node `v26.x`)
- **Package Manager**: **npm** (v10+; bundled with Node) or **Bun** (v1.x+)

---

## Project Structure

```text
CRUNCHIER/
├── CUSTOMER/                 # Customer storefront application (TanStack Start + React 19)
│   ├── src/                  # App routes, components, cart context, menu data
│   ├── .env                  # Customer app environment variables
│   ├── package.json          # Customer scripts & dependencies
│   └── vite.config.ts        # Vite + TanStack Start configuration
├── KITCHEN/                  # Kitchen operations & KDS portal (TanStack Start + React 19)
│   ├── src/                  # Kitchen queue, order rules, adapters, settings
│   ├── drizzle/              # SQL migrations & schema definitions
│   ├── .env                  # Kitchen portal environment variables
│   ├── package.json          # Kitchen scripts & dependencies
│   └── vite.config.ts        # Vite + TanStack Start configuration
├── shared-settings.json      # Synchronized store settings (hours, accepting orders, fee)
└── README.md                 # Project documentation (this file)
```

---

## Quick Start: Running the Project

### 1. Install Dependencies

You must install dependencies inside both the `CUSTOMER` and `KITCHEN` directories.

#### Using npm:

From the workspace root (`CRUNCHIER`):

```bash
# Install Customer app dependencies
npm install --prefix CUSTOMER

# Install Kitchen app dependencies
npm install --prefix KITCHEN
```

*Or navigate into each folder:*

```bash
cd CUSTOMER && npm install
cd ../KITCHEN && npm install
```

#### Using Bun:

```bash
cd CUSTOMER && bun install
cd ../KITCHEN && bun install
```

---

### 2. Environment Variables

Both apps have pre-configured `.env` files in their respective folders for Supabase integration:

- **`CUSTOMER/.env`**:
  - `VITE_SUPABASE_URL`: Supabase project URL
  - `VITE_SUPABASE_PUBLISHABLE_KEY`: Public publishable key
  - Optional server secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- **`KITCHEN/.env`**:
  - `VITE_SUPABASE_URL`: Supabase project URL
  - `VITE_SUPABASE_PUBLISHABLE_KEY`: Public publishable key

> **Note:** Browser-visible variables are prefixed with `VITE_`. Server secrets should remain server-only without the `VITE_` prefix.

---

### 3. Start the Development Servers

To run both applications concurrently, open two terminal windows:

#### Terminal 1 — Run Customer Storefront:

```bash
cd CUSTOMER
npm run dev
```

> 🌐 Customer app runs by default at: **`http://localhost:8080`**

#### Terminal 2 — Run Kitchen Operations Portal:

Because port `8080` is used by the customer app, launch the kitchen app on port `8081`:

```bash
cd KITCHEN
npm run dev -- --port 8081
```

*(If using Bun: `bun run dev --port 8081`)*

> 🍳 Kitchen portal will run at: **`http://localhost:8081`**  
> Direct kitchen routes:
> - Sign in: `http://localhost:8081/login`
> - Order Queue: `http://localhost:8081/kitchen`
> - Menu Manager: `http://localhost:8081/kitchen/menu`
> - Settings: `http://localhost:8081/kitchen/settings`

---

## Available Commands Reference

### Customer App (`CUSTOMER`)

Run these commands inside the `CUSTOMER` directory (or with `npm run --prefix CUSTOMER <script>`):

| Action | npm Command | Bun Command | Description |
| :--- | :--- | :--- | :--- |
| **Start Dev Server** | `npm run dev` | `bun run dev` | Starts Vite dev server with SSR & HMR (`http://localhost:8080`) |
| **Start on Specific Port** | `npm run dev -- --port <port>` | `bun run dev --port <port>` | Runs dev server on custom port (e.g., `--port 3000`) |
| **Build for Production** | `npm run build` | `bun run build` | Compiles client and SSR Nitro server bundle to `dist/` |
| **Development Build** | `npm run build:dev` | `bun run build:dev` | Compiles bundle in development mode |
| **Preview Production** | `npm run preview` | `bun run preview` | Previews the locally built production output |
| **Run Unit Tests** | `npm run test` | `bun run test` | Runs all Vitest test suites once |
| **Watch Unit Tests** | `npm run test:watch` | `bun run test:watch` | Runs Vitest in interactive watch mode |
| **Lint Code** | `npm run lint` | `bun run lint` | Runs ESLint to check TypeScript & React code |
| **Format Code** | `npm run format` | `bun run format` | Formats files using Prettier |

---

### Kitchen Portal (`KITCHEN`)

Run these commands inside the `KITCHEN` directory (or with `npm run --prefix KITCHEN <script>`):

| Action | npm Command | Bun Command | Description |
| :--- | :--- | :--- | :--- |
| **Start Dev Server** | `npm run dev` | `bun run dev` | Starts Vite dev server (binds to `8080`, or next available) |
| **Start on Port 8081** | `npm run dev -- --port 8081` | `bun run dev --port 8081` | Recommended when Customer app is running on `8080` |
| **Build for Production** | `npm run build` | `bun run build` | Compiles client and SSR Nitro server bundle to `dist/` |
| **Development Build** | `npm run build:dev` | `bun run build:dev` | Compiles bundle in development mode |
| **Preview Production** | `npm run preview` | `bun run preview` | Previews the locally built production output |
| **Run Unit Tests** | `npm run test` | `bun run test` | Runs all Vitest test suites (rules, delivery fee, demo) |
| **Watch Unit Tests** | `npm run test:watch` | `bun run test:watch` | Runs Vitest in interactive watch mode |
| **Lint Code** | `npm run lint` | `bun run lint` | Runs ESLint to check TypeScript & React code |
| **Format Code** | `npm run format` | `bun run format` | Formats files using Prettier |

---

## Port Allocations

When running both applications on the same machine:

| Application | Recommended Port | Dev Command | URL |
| :--- | :--- | :--- | :--- |
| **CUSTOMER** | `8080` | `npm run dev` | `http://localhost:8080` |
| **KITCHEN** | `8081` | `npm run dev -- --port 8081` | `http://localhost:8081` |

> *Tip: If Vite finds port 8080 already in use, it will automatically offer or select the next available port.*

---

## Testing

Both apps include unit and integration tests using [Vitest](https://vitest.dev) and `@testing-library/react`.

- To run Customer app tests:
  ```bash
  npm run --prefix CUSTOMER test
  ```
  *(Tests menu pricing, orders service, routing, webhook signature validation)*

- To run Kitchen app tests:
  ```bash
  npm run --prefix KITCHEN test
  ```
  *(Tests kitchen status transition rules, delivery fee logic, demo order simulation, providers)*

- To run both test suites:
  ```bash
  npm run --prefix CUSTOMER test && npm run --prefix KITCHEN test
  ```

---

## Building for Production

To create an optimized production build:

```bash
# Build Customer App
cd CUSTOMER && npm run build

# Build Kitchen Portal
cd ../KITCHEN && npm run build
```

The output bundles will be generated under `CUSTOMER/dist` and `KITCHEN/dist` with:
- `dist/client/`: Static assets, client-side chunks, and CSS
- `dist/server/`: Nitro SSR server entry

To test the production build locally:
```bash
cd CUSTOMER && npm run preview
# In another terminal:
cd KITCHEN && npm run preview -- --port 8081
```

---

## Shared Settings & Database

- **`shared-settings.json`**:  
  Contains synchronized store parameters:
  ```json
  {
    "acceptingOrders": true,
    "openingTime": "10:00",
    "closingTime": "23:00",
    "deliveryFee": 50,
    "soundEnabled": true,
    "timezone": "Asia/Kolkata"
  }
  ```
  Updates made from the Kitchen settings UI (`/kitchen/settings`) write to this file, and the Customer storefront checks it to enforce store opening hours and fee calculation.

- **Kitchen Demo Controls**:  
  In the Kitchen app under **Kitchen → Settings**, staff can use **Start Demo** to generate simulated incoming orders (every ~75 seconds) or **Clear mock data** for an empty view without touching production database records. See [KITCHEN_HANDOFF.md](file:///d:/CRUNCHIER/KITCHEN/KITCHEN_HANDOFF.md) for full details on database migrations, custom Supabase setup, and auth policies.
