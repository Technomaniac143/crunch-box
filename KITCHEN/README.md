# Crunch Box — Kitchen Operations & KDS Portal 🍳

Kitchen Display System (KDS) and back-of-house operations portal for **Crunch Box**. Built with **TanStack Start**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**.

---

## Features

- **Urgency-Sorted Order Queue**: Live kitchen order tickets categorized and color-coded by urgency.
- **Workflow State Transitions**: New ➔ Preparing ➔ Ready for Pickup ➔ Out for Delivery ➔ Delivered / Cancelled.
- **Order Details & Handover**: Detailed item customization display, customer phone/address, delivery handover verification.
- **Daily History & Search**: Search past orders by order ID or phone number, with date filters and daily metrics.
- **Menu Management**: Update items, prices, descriptions, and uploaded photos directly.
- **Kitchen Settings**: Store hours, accepting orders toggle, delivery fee configuration, sound alerts, and demo mode simulations.
- **Cross-App Coordination**: Settings persist to `../shared-settings.json` to synchronize immediately with the Customer app.

---

## How to Run the Kitchen Portal

### Prerequisites

- **Node.js** v20+ (tested with Node v26)
- **npm** v10+ or **Bun**

### 1. Install Dependencies

Navigate into the `KITCHEN` folder:

```bash
cd KITCHEN
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

If running alongside the Customer app (which typically uses port `8080`), run Kitchen on **port `8081`**:

```bash
npm run dev -- --port 8081
```

*(or using Bun: `bun run dev --port 8081`)*

> If running standalone without the customer app, you can simply run `npm run dev` (starts on `http://localhost:8080`).

Access the kitchen portal:
👉 **`http://localhost:8081/kitchen`**  
*(or `http://localhost:8081/login` for sign-in)*

---

## Project Commands

| Command | Bun Alternative | Description |
| :--- | :--- | :--- |
| `npm run dev` | `bun run dev` | Starts Vite dev server (binds to `8080` or next available port) |
| `npm run dev -- --port 8081` | `bun run dev --port 8081` | Runs dev server on port `8081` (recommended with Customer app) |
| `npm run build` | `bun run build` | Compiles client assets and Nitro SSR server to `dist/` |
| `npm run build:dev` | `bun run build:dev` | Compiles build in development mode |
| `npm run preview` | `bun run preview` | Runs local preview of production build |
| `npm run test` | `bun run test` | Runs all Vitest test suites (rules, fee, demo simulation) |
| `npm run test:watch` | `bun run test:watch` | Runs Vitest in watch mode |
| `npm run lint` | `bun run lint` | Runs ESLint to check code quality |
| `npm run format` | `bun run format` | Formats codebase with Prettier |

---

## Running Tests

To run the Vitest suite for Kitchen Ops:

```bash
npm run test
```

Test coverage includes:
- `src/test/kitchen-rules.test.ts`: Order status lifecycle & state transitions
- `src/test/delivery-fee.test.ts`: Fee validation & calculation logic
- `src/test/kitchen-demo.test.ts`: Simulation timers & mock dataset behavior
- `src/test/kitchen-provider.test.tsx`: Kitchen context state preservation
- `src/test/app-routing.test.tsx`: Route resolution

---

## Key App Routes

| Route | Description |
| :--- | :--- |
| `/login` | Kitchen staff authentication (Cloud / Supabase Auth) |
| `/kitchen` | Active order tickets sorted by preparation urgency |
| `/kitchen/orders` | Complete list of today's orders including exceptions |
| `/kitchen/orders/:id` | Detailed order view, preparation checklist & handover |
| `/kitchen/history` | Historical orders, phone/order search & daily aggregates |
| `/kitchen/settings` | Operating hours, accepting orders, delivery fee & live environment status |
| `/kitchen/menu` | Menu catalog, item photos, and price management |

---

## Live Realtime Environment & Kitchen Location

The Kitchen portal runs on live Supabase PostgreSQL CDC (`postgres_changes`) without mock data simulation:
- **Physical Location**: Outside Wingz Badminton Academy, Adjacent to Pooja Supermarket (Opp. Gem Groove), Rajiv Gandhi Salai (OMR), Padur, Tamil Nadu - 603103
- **Contact On-Duty**: `+91 63697 15501` (Amalan)
- **FSSAI License**: `22426077000999` (Government of Tamil Nadu, Food Safety Wing)
- **Realtime Channel**: `kitchen-orders-realtime` on `public.orders`

