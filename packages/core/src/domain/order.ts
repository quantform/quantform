import { v4 } from 'uuid';

import { timestamp } from '../shared';
import { Balance } from './balance';
import { Component } from './component';
import { invalidArgumentError } from './error';
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
    if (!quantity || Number.isNaN(quantity)) {
      throw invalidArgumentError(quantity);
    }

    if (rate && (Number.isNaN(rate) || rate <= 0)) {
      throw invalidArgumentError(rate);
    }
  }

  toString() {
    return this.id;
  }

  calculateBalanceToLock(base: Balance, quote: Balance): { base: number; quote: number } {
    const qty = Math.abs(this.quantity);

    if (this.quantity > 0) {
      switch (this.type) {
        case 'MARKET':
          return {
            base: 0,
            quote: quote.free
          };

        case 'LIMIT':
          return {
            base: 0,
            quote: quote.asset.ceil(this.rate * qty)
          };
      }
    }

    if (this.quantity < 0) {
      return {
        base: qty,
        quote: 0
      };
    }
  }
}
