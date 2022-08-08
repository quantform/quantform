import { Instrument } from '../domain';
import { decimal, pnl, timestamp } from '../shared';
import { Component } from './component';

export type PositionMode = 'CROSS' | 'ISOLATED';

export class Position implements Component {
  kind = 'position';
  timestamp: timestamp;
  estimatedUnrealizedPnL?: decimal;

  get margin(): decimal {
    return this.instrument.quote.fixed(this.size.abs().div(this.leverage));
  }

  constructor(
    readonly id: string,
    readonly instrument: Instrument,
    readonly mode: PositionMode,
    public averageExecutionRate: decimal,
    public size: decimal,
    public leverage: number
  ) {}

  calculateEstimatedUnrealizedPnL(rate: decimal): decimal {
    this.estimatedUnrealizedPnL = this.instrument.quote.fixed(
      pnl(this.averageExecutionRate, rate, this.size)
    );

    return this.estimatedUnrealizedPnL;
  }

  toString() {
    return this.id;
  }
}
