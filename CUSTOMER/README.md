# Crunch Box — Customer Storefront Web App 🍔

The customer-facing web application for **Crunch Box** ("Good Food. Great Vibes."). Built with **TanStack Start**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## Features

- **Menu & Combos Catalogue**: Browse food items, combos, customize variations, and add to cart.
- **Cart & Checkout**: Reactive shopping cart persisted across sessions with delivery calculations.
- **Order Tracking & Success**: Order confirmation screen with real-time state.
- **Synchronized Store Settings**: Reads operating hours, order acceptance status, and delivery fee from `../shared-settings.json`.

---

## How to Run the Customer App

### Prerequisites

- **Node.js** v20+ (tested with Node v26)
- **npm** v10+ or **Bun**

### 1. Install Dependencies

Navigate into the `CUSTOMER` folder:

```bash
cd CUSTOMER
npm install
```

*(or using Bun: `bun install`)*

### 2. Configure Environment Variables

Verify the `.env` file in this directory:

```env
VITE_SUPABASE_URL="https://wvjtozkmisrcbgevdxvj.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"
```

### 3. Start the Development Server

```bash
npm run dev
```

*(or with Bun: `bun run dev`)*

The customer app will start with SSR and Hot Module Replacement (HMR) at:
👉 **`http://localhost:8080`**

To specify a custom port:
```bash
npm run dev -- --port 3000
```

---

## Project Commands

| Command | Bun Alternative | Description |
| :--- | :--- | :--- |
| `npm run dev` | `bun run dev` | Starts Vite development server at `http://localhost:8080` |
| `npm run dev -- --port <port>` | `bun run dev --port <port>` | Starts dev server on specified port |
| `npm run build` | `bun run build` | Builds client assets and Nitro SSR server to `dist/` |
| `npm run build:dev` | `bun run build:dev` | Compiles build in development mode |
| `npm run preview` | `bun run preview` | Runs local preview of production build |
| `npm run test` | `bun run test` | Runs all Vitest test suites (menu pricing, routing, webhooks) |
| `npm run test:watch` | `bun run test:watch` | Runs Vitest in watch mode |
| `npm run lint` | `bun run lint` | Lints project files with ESLint |
| `npm run format` | `bun run format` | Formats codebase with Prettier |

---

## Running Tests

To run the automated Vitest test suite:

```bash
npm run test
```

Test coverage includes:
- `src/test/menu-pricing.test.ts`: Menu calculation & discount rules
- `src/test/orders.test.ts`: Order generation & persistence
- `src/test/app-routing.test.tsx`: Route resolution
- `src/test/webhook.test.ts`: HMAC signature verification for payment webhooks

---

## Key App Routes

| Route | Description |
| :--- | :--- |
| `/` | Landing page featuring hero, signature items, and reviews |
| `/menu` | Full category-filtered menu items |
| `/combos` | Value meal combos |
| `/cart` | Interactive slide-over / cart review |
| `/checkout` | Checkout with delivery address and payment choice |
| `/order-success` | Post-order tracking & details |
| `/about` | Crunch Box brand story & mission |
| `/contact` | Store location, contact details & operating hours |

---

## Technology Stack

- **Framework**: TanStack Start (Full-stack SSR with Nitro)
- **UI Library**: React 19
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **UI Primitives**: Radix UI
- **Testing**: Vitest & Testing Library
