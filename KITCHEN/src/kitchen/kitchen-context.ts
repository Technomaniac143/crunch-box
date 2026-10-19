import { createContext, useContext } from "react";
import type { ConnectionState, KitchenSettings, Order, OrderStatus } from "./domain/types";

export interface KitchenCtx {
  orders: Order[];
  loading: boolean;
  settings: KitchenSettings | null;
  connection: ConnectionState;
  unread: Set<string>;
  pending: Set<string>;
  acknowledge: (id?: string) => void;
  updateStatus: (id: string, to: OrderStatus) => Promise<void>;
  updateSettings: (patch: Partial<KitchenSettings>) => Promise<void>;
  refresh: () => Promise<void>;
  isMock: boolean;
  demoEnabled: boolean;
  setDemoEnabled: (enabled: boolean) => Promise<void>;
}

// Keep context identity independent of the hot-reloaded provider component.
export const KitchenContext = createContext<KitchenCtx | null>(null);

export function useKitchen() {
  const value = useContext(KitchenContext);
  if (!value) throw new Error("useKitchen must be inside KitchenProvider");
  return value;
}
