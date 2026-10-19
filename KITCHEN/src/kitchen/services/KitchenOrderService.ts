import type {
  ConnectionState,
  KitchenSettings,
  Order,
  OrderEvent,
  OrderHistoryQuery,
  OrderStatus,
} from "../domain/types";

/**
 * The only way UI code reads or changes kitchen data.
 * Swap the mock adapter for a backend adapter during integration.
 */
export interface KitchenOrderService {
  readonly isMock: boolean;
  readonly demoEnabled: boolean;
  initializeDemoMode(): void;
  setDemoEnabled(enabled: boolean): Promise<void>;
  listActiveOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  updateOrderStatus(id: string, to: OrderStatus): Promise<Order>;
  listOrderHistory(query: OrderHistoryQuery): Promise<Order[]>;
  getSettings(): Promise<KitchenSettings>;
  updateSettings(patch: Partial<KitchenSettings>): Promise<KitchenSettings>;
  /** Push channel for new orders and updates. Returns unsubscribe. */
  subscribe(onEvent: (e: OrderEvent) => void): () => void;
  onConnectionChange(cb: (s: ConnectionState) => void): () => void;
}
