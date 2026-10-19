# Crunch Box Kitchen Ops — Integration Handoff

Standalone kitchen app (TanStack Start + React + TypeScript + Tailwind v4). **Menu, photos, delivery fee and sign-in use Lovable Cloud; orders and other kitchen settings are demo-only.**

## Run

```
bun install
bun run dev      # http://localhost:8080
bun run build
bunx vitest run
```

## Use your own database and keys

Configure your deployment's environment with your own values; do not reuse this project's configured connection.

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`: your database project URL and public/publishable key, required for menu and sign-in. These are browser-visible, so never put a secret/service-role key here. Rebuild after changing browser variables.
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`: matching runtime values for server-side database calls.
- Current menu/auth flows do not require a service-role key. Future privileged operations and payment webhook secrets must stay server-only in your host's secret store, never committed or prefixed `VITE_`.
- Apply all SQL migrations in `drizzle/migrations` in order to the new database, preserving grants and row-level security, including `0002_editable_delivery_fee.sql`.
- Create a public `menu-images` storage bucket with a 5 MB upload limit, accepted image MIME types and the migration's access policies. Copy any existing image files separately; database migration does not copy storage files.
- Configure Auth's site URL and allowed redirects for your own deployment, including `/login`. Set email delivery/confirmation settings intentionally. The first newly registered account receives the admin role: create the intended kitchen account before permitting other sign-ups.
- Regenerate `src/integrations/supabase/types.ts` if your schema differs. The current schema supports menu and roles, not live orders.
- Never commit private credentials or a secret-bearing environment file. The generated client reads environment configuration; it contains no fixed private key.

## Demo controls

In **Kitchen → Settings**, **Clear mock data** stops the simulated incoming-order timer and removes all fictional active and historical orders. **Start demo** creates a fresh fictional dataset and restarts simulation.
The choice is saved in this browser and survives refresh/sign-out; another browser has its own choice. No database rows, saved menu prices, photos or accounts are deleted. Demo order changes are in-memory and reset on refresh. Kitchen hours/sound/accepting settings are also in-memory, not persisted yet.
Clearing demo prepares an empty kitchen view; it does **not** connect live orders or payments. The app explicitly shows that live-order integration is pending.

## Routes

| Route                 | Purpose                                                   |
| --------------------- | --------------------------------------------------------- |
| `/login`              | Shared kitchen sign-in (Cloud auth)                       |
| `/kitchen`            | Summary + urgency-sorted queue                            |
| `/kitchen/orders`     | All of today's orders incl. issues                        |
| `/kitchen/orders/:id` | Full order, delivery handover, valid next actions         |
| `/kitchen/history`    | Search by order no./phone, date filter, daily summary     |
| `/kitchen/settings`   | Accepting orders, hours, ₹50 fee, sound, clear/start demo |
| `/kitchen/menu`       | Persisted menu, prices and photos                         |

## Domain & services

- `src/kitchen/domain/types.ts` — Product, ProductVariant, Order, OrderItem, OrderStatus, PaymentStatus, KitchenSettings
- `src/kitchen/domain/rules.ts` — transitions, fee, sorting, Asia/Kolkata formatting
- `src/kitchen/services/KitchenOrderService.ts` — `KitchenOrderService`, `KitchenAuthService` interfaces
- `src/kitchen/services/index.ts` — the single place adapters are wired
- `src/kitchen/notifications/alerts.ts` — sound/vibration, separate from data

## Mock files (replace / delete at integration)

- `src/kitchen/services/mock/mockData.ts` — development dataset
- `src/kitchen/services/mock/mockOrderService.ts` — in-memory adapter, simulates a new order ~every 75s

UI never imports mock files directly.

## Still needs backend integration

1. Auth is real; future live kitchen operations must also enforce authorization server-side, not only via the page's sign-in guard.
2. Orders table shared with the customer site; reconcile catalogue from customer `src/data/menu.ts` / `src/data/site.ts`.
3. Orders enter `new` only after the payment provider confirms payment (webhook, server-verified).
4. Status updates enforced server-side with the same transition rules.
5. Realtime subscription in place of the mock timer; optional web push for closed-browser alerts.
6. Refund processing for rejected/cancelled orders.
7. Persisted kitchen settings; customer site should respect `acceptingOrders` and hours.
