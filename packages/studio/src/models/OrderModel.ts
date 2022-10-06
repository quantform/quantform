import { Order } from '@quantform/core';

export type OrderModel = {
  key: string;
  instrument: string;
  quantity: string;
  quantityExecuted: string;
  rate?: string;
  state: string;
  averageExecutionRate?: string;
  createdAt: number;
  isBuy: boolean;
  timestamp: number;
};

export function toOrderModel(order: Order): OrderModel {
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
