import { Order } from '@quantform/core';
import { createSnapshotContext } from '../../session/services';

export interface OrderSnapshot {
  key: string;
  instrument: string;
  side: string;
  type: string;
  quantity: number;
  rate: number;
  state: string;
  quantityExecuted: number;
  averageExecutionRate: number;
  createdAt: number;
  kind: string;
}

export function getOrderSnapshot(order: Order): OrderSnapshot {
  return {
    ...order,
    key: order.id,
    instrument: order.instrument.toString()
  };
}

export const [useOrderSnapshotContext, OrderSnapshotProvider] =
  createSnapshotContext<OrderSnapshot>({});
