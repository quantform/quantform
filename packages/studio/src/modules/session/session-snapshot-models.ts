import { Balance, Order, Position } from '@quantform/core';

export type SnapshotComponent = {
  key: string;
};

export type SessionSnapshotContextState = {
  balance: Record<string, BalanceSnapshot>;
  orders: Record<string, OrderSnapshot>;
  positions: Record<string, PositionSnapshot>;
};

export type BalanceSnapshot = SnapshotComponent & {
  asset: string;
  adapter: string;
  free: number;
  locked: number;
  scale: number;
  kind: string;
  timestamp: number;
};

export function getBalanceSnapshot(balance: Balance): BalanceSnapshot {
  return {
    key: balance.asset.toString(),
    asset: balance.asset.name,
    adapter: balance.asset.adapter,
    free: balance.free,
    locked: balance.locked,
    scale: balance.asset.scale,
    kind: balance.kind,
    timestamp: balance.timestamp
  };
}

export interface OrderSnapshot extends SnapshotComponent {
  instrument: string;
  side: string;
  type: string;
  quantity: number;
  quantityExecuted: number;
  rate: number;
  state: string;
  averageExecutionRate: number;
  createdAt: number;
  kind: string;
  timestamp: number;
}

export function getOrderSnapshot(order: Order): OrderSnapshot {
  return {
    ...order,
    key: order.id,
    instrument: order.instrument.toString(),
    state: order.state.toString()
  };
}

export interface PositionSnapshot extends SnapshotComponent {
  instrument: string;
  size: number;
  averageExecutionRate: number;
  leverage: number;
  mode: string;
  estimatedUnrealizedPnL: number;
  kind: string;
  timestamp: number;
}

export function getPositionSnapshot(position: Position): PositionSnapshot {
  return {
    ...position,
    key: position.id,
    instrument: position.instrument.toString()
  };
}
