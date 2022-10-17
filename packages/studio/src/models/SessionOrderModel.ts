import { Order } from '@quantform/core';
import { z } from 'zod';

export const SessionOrderContract = z.object({
  key: z.string(),
  instrument: z.string(),
  quantity: z.string(),
  quantityExecuted: z.string(),
  rate: z.string().optional(),
  state: z.string(),
  averageExecutionRate: z.string().optional(),
  createdAt: z.number(),
  isBuy: z.boolean(),
  timestamp: z.number()
});

export type SessionOrderModel = z.infer<typeof SessionOrderContract>;

export function toSessionOrderModel(order: Order): SessionOrderModel {
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
