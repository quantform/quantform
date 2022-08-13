import { Instrument } from '../domain';
import { decimal, timestamp } from '../shared';
import { Component } from './component';

export interface Liquidity {
  rate: decimal;
  quantity: decimal;
  next: this;
}

export const LiquidityAskComparer = (lhs: { rate: decimal }, rhs: { rate: decimal }) =>
  lhs.rate.comparedTo(rhs.rate);
export const LiquidityBidComparer = (lhs: { rate: decimal }, rhs: { rate: decimal }) =>
  rhs.rate.comparedTo(lhs.rate);

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
