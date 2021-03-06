import { Instrument } from '../domain';
import { timestamp } from '../shared';
import { Component } from './component';

/**
 * Provides an access to pending buy and sell orders on the specific market.
 */
export class Orderbook implements Component {
  id: string;
  kind = 'orderbook';
  timestamp: timestamp;
  bestAskRate: number;
  bestAskQuantity: number;
  bestBidRate: number;
  bestBidQuantity: number;

  get midRate(): number {
    return this.instrument.quote.fixed((this.bestAskRate + this.bestBidRate) / 2);
  }

  constructor(public readonly instrument: Instrument) {
    this.id = instrument.id;
  }

  toString() {
    return this.instrument.toString();
  }
}
