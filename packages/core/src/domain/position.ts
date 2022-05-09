import { Instrument } from '../domain';
import { pnl, timestamp } from '../shared';
import { Component } from './component';

export type PositionMode = 'CROSS' | 'ISOLATED';

export class Position implements Component {
  kind = 'position';
  timestamp: timestamp;
  estimatedUnrealizedPnL?: number;

  get margin(): number {
    return this.instrument.quote.fixed(Math.abs(this.size) / this.leverage);
  }

  constructor(
    readonly id: string,
    readonly instrument: Instrument,
    readonly mode: PositionMode,
    public averageExecutionRate: number,
    public size: number,
    public leverage: number
  ) {}

  calculateEstimatedUnrealizedPnL(rate: number): number {
    this.estimatedUnrealizedPnL = this.instrument.quote.fixed(
      pnl(this.averageExecutionRate, rate, this.size)
    );

    return this.estimatedUnrealizedPnL;
  }

  toString() {
    return this.id;
  }
}
