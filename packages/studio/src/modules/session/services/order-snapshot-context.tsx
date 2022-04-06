import { Order } from '@quantform/core';
import { createSnapshotContext } from '.';

export interface OrderSnapshot {
  key: string;
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
}

export function getOrderSnapshot(order: Order): OrderSnapshot {
  return {
    ...order,
    key: order.id,
    instrument: order.instrument.toString(),
    state: order.state.toString()
  };
}

export const [useOrderSnapshotContext, OrderSnapshotProvider] =
  createSnapshotContext<OrderSnapshot>({});
