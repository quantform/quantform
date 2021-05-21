import { timestamp } from '../common';
import { Instrument } from '../domain';
import { Component } from './component';

export class Orderbook implements Component {
  timestamp: timestamp;
  bestAskRate: number;
  bestAskQuantity: number;
  bestBidRate: number;
  bestBidQuantity: number;

  get midRate(): number {
    return this.instrument.quote.fixed((this.bestAskRate + this.bestBidRate) / 2);
  }

  constructor(public readonly instrument: Instrument) {}

  toString() {
    return this.instrument.toString();
  }
}
