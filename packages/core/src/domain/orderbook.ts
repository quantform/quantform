import { Instrument } from '../domain';
import { decimal, timestamp } from '../shared';
import { Component } from './component';

export class Liquidity {
  quantity: decimal;

  next: Liquidity;

  constructor(readonly rate: decimal, quantity: decimal, next?: Liquidity) {
    this.quantity = quantity;
    this.next = next;
  }

  visit(fn: (liquidity: Liquidity) => boolean) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let top: Liquidity = this;

    while (top) {
      if (!fn(top)) {
        break;
      }

      top = top.next;
    }
  }

  reduce<T>(fn: (liquidity: Liquidity, aggregate: T) => T, value: T) {
    this.visit(it => {
      value = fn(it, value);

      return true;
    });

    return value;
  }
}

/**
 * Provides an access to pending buy and sell orders on the specific market.
 */
export class Orderbook implements Component {
  id: string;
  kind = 'orderbook';
  timestamp: timestamp;

  asks: Liquidity;
  bids: Liquidity;

  constructor(public readonly instrument: Instrument) {
    this.id = instrument.id;
  }

  toString() {
    return this.instrument.toString();
  }
}
