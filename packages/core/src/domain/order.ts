import { v4 } from 'uuid';

import { timestamp } from '../shared';
import { Component } from './component';
import { InstrumentSelector } from './instrument';

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP-MARKET' | 'STOP-LIMIT';
export type OrderState =
  | 'NEW'
  | 'PENDING'
  | 'FILLED'
  | 'CANCELING'
  | 'CANCELED'
  | 'REJECTED';

export class Order implements Component {
  kind = 'order';
  timestamp: timestamp;
  id = v4();
  externalId: string;
  state: OrderState = 'NEW';

  quantityExecuted = 0;
  averageExecutionRate: number;
  createdAt: timestamp;

  static market(instrument: InstrumentSelector, quantity: number): Order {
    return new Order(instrument, 'MARKET', quantity);
  }

  static limit(instrument: InstrumentSelector, quantity: number, rate: number): Order {
    return new Order(instrument, 'LIMIT', quantity, rate);
  }

  static stopMarket(
    instrument: InstrumentSelector,
    quantity: number,
    stopRate: number
  ): Order {
    return new Order(instrument, 'STOP-MARKET', quantity, undefined, stopRate);
  }

  static stopLimit(
    instrument: InstrumentSelector,
    quantity: number,
    rate: number,
    stopRate: number
  ): Order {
    return new Order(instrument, 'STOP-LIMIT', quantity, rate, stopRate);
  }

  constructor(
    readonly instrument: InstrumentSelector,
    readonly type: OrderType,
    readonly quantity: number,
    readonly rate?: number,
    readonly stopRate?: number
  ) {
    if (quantity <= 0 || Number.isNaN(quantity)) {
      throw new Error(`invalid order quantity: ${quantity}`);
    }

    if (rate && (Number.isNaN(quantity) || rate <= 0)) {
      throw new Error('invalid order rate');
    }
  }

  toString() {
    return this.id;
  }
}
