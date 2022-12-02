import { Component, Instrument } from '@lib/domain';
import { decimal } from '@lib/shared';

export interface Liquidity {
  rate: decimal;
  quantity: decimal;
  next: this | undefined;
}

export const LiquidityAskComparer = (lhs: { rate: decimal }, rhs: { rate: decimal }) =>
  lhs.rate.comparedTo(rhs.rate);
export const LiquidityBidComparer = (lhs: { rate: decimal }, rhs: { rate: decimal }) =>
  rhs.rate.comparedTo(lhs.rate);

/**
 * Provides an access to pending buy and sell orders on the specific market.
 */
export class Orderbook implements Component {
  readonly id: string;

  constructor(
    public timestamp: number,
    public readonly instrument: Instrument,
    public asks: Liquidity,
    public bids: Liquidity
  ) {
    this.id = instrument.id;
  }
}
