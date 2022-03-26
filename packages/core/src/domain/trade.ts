import { timestamp } from '../shared';
import { Instrument } from '.';
import { Component } from './component';

/**
 * Simple trade or ticker executed on the market, it's a match of buyer
 * and seller of the same asset.
 */
export class Trade implements Component {
  timestamp: timestamp;
  rate: number;
  quantity: number;

  constructor(public readonly instrument: Instrument) {}

  toString() {
    return this.instrument.toString();
  }
}
