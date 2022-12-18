import {
  Balance,
  Component,
  Fundable,
  Instrument,
  InvalidArgumentsError
} from '@lib/component';
import { d, decimal, hash } from '@lib/shared';

export type OrderState =
  | 'NEW'
  | 'PENDING'
  | 'FILLED'
  | 'CANCELING'
  | 'CANCELED'
  | 'REJECTED';

export class Order implements Fundable, Component {
  static type = hash(Order.name);
  readonly type = Order.type;

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
      throw new InvalidArgumentsError({ quantity });
    }

    if (rate && rate.lessThanOrEqualTo(0)) {
      throw new InvalidArgumentsError({ rate });
    }
  }

  getFundingAmount(balance: Balance): decimal {
    const quantityLeft = this.quantity.abs().minus(this.quantityExecuted);

    if (
      this.instrument.quote.id === balance.asset.id &&
      this.quantity.greaterThan(d.Zero)
    ) {
      if (this.rate) {
        return quantityLeft.mul(this.rate).abs();
      }

      return balance.free;
    }

    if (this.instrument.base.id === balance.asset.id && this.quantity.lessThan(d.Zero)) {
      return quantityLeft;
    }

    return d.Zero;
  }
}
