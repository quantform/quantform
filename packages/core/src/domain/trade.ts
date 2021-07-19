import { timestamp } from '../common';
import { Instrument } from '.';
import { Component } from './component';

export class Trade implements Component {
  timestamp: timestamp;
  rate: number;
  quantity: number;

  constructor(public readonly instrument: Instrument) {}

  toString() {
    return this.instrument.toString();
  }
}
