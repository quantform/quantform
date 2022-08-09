import { v4 } from 'uuid';

import { d, decimal, timestamp } from '../shared';
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

  quantityExecuted = d.Zero;
  averageExecutionRate: decimal;
  createdAt: timestamp;

  static market(instrument: InstrumentSelector, quantity: decimal): Order {
    return new Order(instrument, 'MARKET', quantity);
  }

  static limit(instrument: InstrumentSelector, quantity: decimal, rate: decimal): Order {
    return new Order(instrument, 'LIMIT', quantity, rate);
  }

  static stopMarket(
    instrument: InstrumentSelector,
    quantity: decimal,
    stopRate: decimal
  ): Order {
    return new Order(instrument, 'STOP-MARKET', quantity, undefined, stopRate);
  }

  static stopLimit(
    instrument: InstrumentSelector,
    quantity: decimal,
    rate: decimal,
    stopRate: decimal
  ): Order {
    return new Order(instrument, 'STOP-LIMIT', quantity, rate, stopRate);
  }

  constructor(
    readonly instrument: InstrumentSelector,
    readonly type: OrderType,
    readonly quantity: decimal,
    readonly rate?: decimal,
    readonly stopRate?: decimal
  ) {
    if (!quantity || Number.isNaN(quantity)) {
      throw invalidArgumentError(quantity);
    }

    if (rate && rate.lessThanOrEqualTo(0)) {
      throw invalidArgumentError(rate);
    }
  }

  toString() {
    return this.id;
  }

  calculateBalanceToLock(
    base: Balance,
    quote: Balance
  ): { base: decimal; quote: decimal } {
    const qty = this.quantity.abs();

    if (this.quantity.greaterThan(0)) {
      switch (this.type) {
        case 'MARKET':
          return {
            base: d.Zero,
            quote: quote.free
          };

        case 'LIMIT':
          return {
            base: d.Zero,
            quote: quote.asset.ceil(this.rate.mul(qty))
          };
      }
    }

    if (this.quantity.lessThan(0)) {
      return {
        base: qty,
        quote: d.Zero
      };
    }
  }
}
