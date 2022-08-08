import { Instrument } from '../domain';
import { decimal, timestamp } from '../shared';
import { Component } from './component';

/**
 * Provides an access to pending buy and sell orders on the specific market.
 */
export class Orderbook implements Component {
  id: string;
  kind = 'orderbook';
  timestamp: timestamp;
  bestAskRate: decimal;
  bestAskQuantity: decimal;
  bestBidRate: decimal;
  bestBidQuantity: decimal;

  get midRate(): decimal {
    return this.instrument.quote.floor(this.bestAskRate.add(this.bestBidRate).div(2));
  }

  constructor(public readonly instrument: Instrument) {
    this.id = instrument.id;
  }

  toString() {
    return this.instrument.toString();
  }
}
