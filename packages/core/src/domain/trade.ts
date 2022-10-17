import { decimal } from '../shared';
import { Instrument } from '.';
import { Component } from './component';

/**
 * Simple trade or ticker executed on the market, it's a match of buyer
 * and seller of the same asset.
 */
export class Trade implements Component {
  readonly id: string;
  readonly kind = 'trade';

  constructor(
    public timestamp: number,
    public readonly instrument: Instrument,
    public rate: decimal,
    public quantity: decimal
  ) {
    this.id = instrument.id;
  }

  toString() {
    return this.instrument.toString();
  }
}
