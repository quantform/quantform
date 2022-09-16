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
  free: string;
  locked: string;
  scale: number;
  kind: string;
  timestamp: number;
};

export function getBalanceSnapshot(balance: Balance): BalanceSnapshot {
  return {
    key: balance.asset.id,
    asset: balance.asset.name,
    adapter: balance.asset.adapterName,
    free: balance.free.toFixed(balance.asset.scale),
    locked: balance.locked.toFixed(balance.asset.scale),
    scale: balance.asset.scale,
    kind: balance.kind,
    timestamp: balance.timestamp
  };
}

export interface OrderSnapshot extends SnapshotComponent {
  instrument: string;
  type: string;
  quantity: string;
  quantityExecuted: string;
  rate?: string;
  state: string;
  averageExecutionRate?: string;
  createdAt: number;
  kind: string;
  isBuy: boolean;
  timestamp: number;
}

export function getOrderSnapshot(order: Order): OrderSnapshot {
  return {
    ...order,
    key: order.id,
    instrument: order.instrument.id,
    state: order.state.toString(),
    quantity: order.quantity.toString(),
    quantityExecuted: order.quantity.toString(),
    rate: order.rate?.toString(),
    averageExecutionRate: order.averageExecutionRate?.toString(),
    isBuy: order.quantity.greaterThan(0)
  };
}

export interface PositionSnapshot extends SnapshotComponent {
  instrument: string;
  size: string;
  averageExecutionRate: string;
  leverage: number;
  mode: string;
  estimatedUnrealizedPnL?: string;
  kind: string;
  timestamp: number;
}

export function getPositionSnapshot(position: Position): PositionSnapshot {
  return {
    ...position,
    key: position.id,
    instrument: position.instrument.id,
    size: position.size.toString(),
    averageExecutionRate: position.averageExecutionRate.toString(),
    estimatedUnrealizedPnL: position.estimatedUnrealizedPnL?.toString()
  };
}
