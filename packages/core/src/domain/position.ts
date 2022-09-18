import { Instrument } from '../domain';
import { decimal, pnl } from '../shared';
import { Component } from './component';

export type PositionMode = 'CROSS' | 'ISOLATED';

export class Position implements Component {
  readonly kind = 'position';
  estimatedUnrealizedPnL?: decimal;

  get margin(): decimal {
    return this.instrument.quote.floor(this.size.abs().div(this.leverage));
  }

  constructor(
    public timestamp: number,
    readonly id: string,
    readonly instrument: Instrument,
    readonly mode: PositionMode,
    public averageExecutionRate: decimal,
    public size: decimal,
    public leverage: number
  ) {}

  calculateEstimatedUnrealizedPnL(rate: decimal): decimal {
    this.estimatedUnrealizedPnL = this.instrument.quote.floor(
      pnl(this.averageExecutionRate, rate, this.size)
    );

    return this.estimatedUnrealizedPnL;
  }

  toString() {
    return this.id;
  }
}
