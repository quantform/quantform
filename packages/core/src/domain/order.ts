import { d, decimal } from '../shared';
import { Balance } from './balance';
import { Component } from './component';
import { invalidArgumentError } from './error';
import { Instrument } from './instrument';

export type OrderState =
  | 'NEW'
  | 'PENDING'
  | 'FILLED'
  | 'CANCELING'
  | 'CANCELED'
  | 'REJECTED';

export class Order implements Component {
  readonly kind = 'order';
  state: OrderState = 'NEW';
  quantityExecuted = d.Zero;
  averageExecutionRate?: decimal;
  externalId?: string;

  constructor(
    public timestamp: number,
    readonly id: string,
    readonly instrument: Instrument,
    readonly quantity: decimal,
    public createdAt: number,
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
  ): { base?: decimal; quote?: decimal } {
    const qty = this.quantity.abs();

    if (this.quantity.greaterThan(0)) {
      if (this.rate) {
        return {
          base: d.Zero,
          quote: quote.asset.ceil(this.rate.mul(qty))
        };
      } else {
        return {
          base: d.Zero,
          quote: quote.free
        };
      }
    }

    if (this.quantity.lessThan(0)) {
      return {
        base: qty,
        quote: d.Zero
      };
    }

    return {};
  }
}
