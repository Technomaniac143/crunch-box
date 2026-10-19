// Single wiring point: connects to live Supabase backend with reversible demo mode.
import { createProductionOrderService } from "./cloud/supabaseOrderService";

export const orderService = createProductionOrderService();
export { authService } from "./cloud/cloudAuthService";
export * as menuService from "./cloud/menuService";
export type { KitchenOrderService } from "./KitchenOrderService";
