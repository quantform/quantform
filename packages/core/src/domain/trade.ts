import { decimal, timestamp } from '../shared';
import { Instrument } from '.';
import { Component } from './component';

/**
 * Simple trade or ticker executed on the market, it's a match of buyer
 * and seller of the same asset.
 */
export class Trade implements Component {
  id: string;
  kind = 'trade';
  timestamp: timestamp;
  rate: decimal;
  quantity: decimal;

  constructor(public readonly instrument: Instrument) {
    this.id = instrument.id;
  }

  toString() {
    return this.instrument.toString();
  }
}
